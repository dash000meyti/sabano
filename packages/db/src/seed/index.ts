import { count, eq } from 'drizzle-orm';
import { locales, type Locale } from '@sabano/i18n';
import { getDb } from '../client';
import {
  faqs,
  faqTranslations,
  partners,
  partnerTranslations,
  people,
  personTranslations,
  posts,
  postTranslations,
  settings,
  shareholders,
  shareholderTranslations,
} from '../schema';
import { defaultSettings } from '../settings';
import { readingMinutes } from '../text';
import { seedFaqs, seedPartners, seedPeople, seedPosts, seedShareholders } from './base';
import es from './content/es.json';
import en from './content/en.json';
import fa from './content/fa.json';
import ru from './content/ru.json';
import zh from './content/zh.json';

type SeedContent = typeof fa;
const content: Record<Locale, SeedContent> = { fa, en, zh, ru, es };

/** Settings row written once the database has been seeded (never shown in the panel). */
export const SEED_MARKER = 'system.seededAt';

/**
 * Fills a brand-new database with the fund's current public content, exactly once.
 * A marker row (not "is a table empty?") decides, so deleting every person or post
 * in the panel never triggers a re-seed (which would duplicate content or crash on
 * unique slugs at startup). Returns true when it seeded.
 */
export function seedDatabase({ force = false }: { force?: boolean } = {}): boolean {
  const db = getDb();
  if (!force) {
    if (db.select({ k: settings.key }).from(settings).where(eq(settings.key, SEED_MARKER)).get()) return false;
    // Databases seeded before the marker existed: any content means "already seeded".
    const hasContent = [people, posts, faqs, partners, shareholders].some((t) => (db.select({ n: count() }).from(t).get()?.n ?? 0) > 0);
    if (hasContent) {
      db.insert(settings).values({ key: SEED_MARKER, value: JSON.stringify('pre-marker') }).onConflictDoNothing().run();
      return false;
    }
  }

  db.transaction((tx) => {
    if (force) {
      for (const table of [postTranslations, posts, faqTranslations, faqs, personTranslations, people, partnerTranslations, partners, shareholderTranslations, shareholders]) {
        tx.delete(table).run();
      }
    }

    seedPeople.forEach((p, i) => {
      const row = tx
        .insert(people)
        .values({ slug: p.slug, group: p.group, photo: p.photo, linkedin: p.linkedin, sortOrder: i })
        .returning({ id: people.id })
        .get();
      for (const l of locales) {
        const t = content[l].people[p.slug as keyof SeedContent['people']];
        tx.insert(personTranslations).values({ personId: row.id, locale: l, name: t.name, role: t.role, bio: t.bio }).run();
      }
    });

    seedPartners.forEach((p, i) => {
      const row = tx.insert(partners).values({ logo: p.logo, url: p.url, sortOrder: i }).returning({ id: partners.id }).get();
      for (const l of locales) {
        tx.insert(partnerTranslations)
          .values({ partnerId: row.id, locale: l, name: content[l].partners[p.key as keyof SeedContent['partners']] })
          .run();
      }
    });

    seedShareholders.forEach((s, i) => {
      const row = tx
        .insert(shareholders)
        .values({ isMain: s.isMain, sortOrder: i })
        .returning({ id: shareholders.id })
        .get();
      for (const l of locales) {
        const t = content[l].shareholders[s.key as keyof SeedContent['shareholders']];
        tx.insert(shareholderTranslations)
          .values({ shareholderId: row.id, locale: l, name: t.name, description: t.description })
          .run();
      }
    });

    seedFaqs.forEach((f, i) => {
      const row = tx.insert(faqs).values({ category: f.category, sortOrder: i }).returning({ id: faqs.id }).get();
      for (const l of locales) {
        const t = content[l].faqs[f.key as keyof SeedContent['faqs']];
        if (t) tx.insert(faqTranslations).values({ faqId: row.id, locale: l, question: t.q, answer: t.a }).run();
      }
    });

    for (const p of seedPosts) {
      const publishedAt = new Date(p.publishedAt);
      const row = tx
        .insert(posts)
        .values({ slug: p.slug, category: p.category, coverImage: p.cover, status: 'published', publishedAt, createdAt: publishedAt, updatedAt: publishedAt })
        .returning({ id: posts.id })
        .get();
      for (const l of locales) {
        const t = content[l].posts[p.slug as keyof SeedContent['posts']];
        if (!t) continue;
        tx.insert(postTranslations)
          .values({
            postId: row.id,
            locale: l,
            title: t.title,
            excerpt: t.excerpt,
            body: t.body,
            coverAlt: t.coverAlt,
            readingMinutes: readingMinutes(t.body, l === 'fa' ? 180 : 200),
            updatedAt: publishedAt,
          })
          .run();
      }
    }

    for (const [key, value] of Object.entries(defaultSettings)) {
      tx.insert(settings).values({ key, value: JSON.stringify(value) }).onConflictDoNothing().run();
    }
    tx.insert(settings)
      .values({ key: SEED_MARKER, value: JSON.stringify(new Date().toISOString()) })
      .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(new Date().toISOString()) } })
      .run();
  });
  return true;
}
