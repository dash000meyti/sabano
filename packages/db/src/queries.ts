import { and, asc, count, desc, eq, inArray, lte } from 'drizzle-orm';
import type { Locale } from '@sabano/i18n';
import { getDb } from './client';
import {
  companies,
  companyTranslations,
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
  type FaqCategory,
  type PostCategory,
  type Sector,
} from './schema';
import { defaultSettings, type SettingsKey, type SettingsMap } from './settings';

/* ------------------------------------------------------------------ */
/* Translation helpers                                                 */
/* ------------------------------------------------------------------ */

const fallbackOrder: Record<Locale, Locale[]> = {
  fa: ['fa', 'en'],
  en: ['en', 'fa'],
  zh: ['zh', 'en', 'fa'],
  ru: ['ru', 'en', 'fa'],
  es: ['es', 'en', 'fa'],
};

/** Picks the best translation for a locale, optionally falling back to en/fa. */
export function pickTranslation<T extends { locale: string }>(
  rows: T[],
  locale: Locale,
  fallback = true,
): T | undefined {
  const order = fallback ? fallbackOrder[locale] : [locale];
  for (const l of order) {
    const hit = rows.find((r) => r.locale === l);
    if (hit) return hit;
  }
  return undefined;
}

function groupBy<T, K extends string | number>(rows: T[], key: (r: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const r of rows) {
    const k = key(r);
    const list = map.get(k);
    if (list) list.push(r);
    else map.set(k, [r]);
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export function getSetting<K extends SettingsKey>(key: K): SettingsMap[K] {
  const row = getDb().select().from(settings).where(eq(settings.key, key)).get();
  if (!row) return defaultSettings[key];
  try {
    const parsed = JSON.parse(row.value) as SettingsMap[K];
    if (Array.isArray(defaultSettings[key])) return parsed;
    return { ...(defaultSettings[key] as object), ...(parsed as object) } as SettingsMap[K];
  } catch {
    return defaultSettings[key];
  }
}

export function setSetting<K extends SettingsKey>(key: K, value: SettingsMap[K]) {
  const json = JSON.stringify(value);
  getDb()
    .insert(settings)
    .values({ key, value: json, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: json, updatedAt: new Date() } })
    .run();
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export type PersonView = {
  id: number;
  slug: string;
  group: 'management' | 'board';
  photo: string | null;
  linkedin: string | null;
  name: string;
  role: string;
  bio: string | null;
};

export function listPeople(locale: Locale): PersonView[] {
  const db = getDb();
  const rows = db
    .select()
    .from(people)
    .where(eq(people.published, true))
    .orderBy(asc(people.sortOrder), asc(people.id))
    .all();
  if (!rows.length) return [];
  const tr = groupBy(
    db.select().from(personTranslations).where(inArray(personTranslations.personId, rows.map((r) => r.id))).all(),
    (t) => t.personId,
  );
  return rows.flatMap((p) => {
    const t = pickTranslation(tr.get(p.id) ?? [], locale);
    if (!t) return [];
    return [{ id: p.id, slug: p.slug, group: p.group, photo: p.photo, linkedin: p.linkedin, name: t.name, role: t.role, bio: t.bio }];
  });
}

/* ------------------------------------------------------------------ */
/* Partners & shareholders                                             */
/* ------------------------------------------------------------------ */

export type PartnerView = { id: number; name: string; logo: string | null; url: string | null };

export function listPartners(locale: Locale): PartnerView[] {
  const db = getDb();
  const rows = db.select().from(partners).where(eq(partners.published, true)).orderBy(asc(partners.sortOrder)).all();
  if (!rows.length) return [];
  const tr = groupBy(
    db.select().from(partnerTranslations).where(inArray(partnerTranslations.partnerId, rows.map((r) => r.id))).all(),
    (t) => t.partnerId,
  );
  return rows.flatMap((p) => {
    const t = pickTranslation(tr.get(p.id) ?? [], locale);
    return t ? [{ id: p.id, name: t.name, logo: p.logo, url: p.url }] : [];
  });
}

export type ShareholderView = {
  id: number;
  name: string;
  description: string | null;
  isMain: boolean;
  logo: string | null;
  url: string | null;
};

export function listShareholders(locale: Locale): ShareholderView[] {
  const db = getDb();
  const rows = db
    .select()
    .from(shareholders)
    .where(eq(shareholders.published, true))
    .orderBy(desc(shareholders.isMain), asc(shareholders.sortOrder))
    .all();
  if (!rows.length) return [];
  const tr = groupBy(
    db
      .select()
      .from(shareholderTranslations)
      .where(inArray(shareholderTranslations.shareholderId, rows.map((r) => r.id)))
      .all(),
    (t) => t.shareholderId,
  );
  return rows.flatMap((s) => {
    const t = pickTranslation(tr.get(s.id) ?? [], locale);
    return t
      ? [{ id: s.id, name: t.name, description: t.description, isMain: s.isMain, logo: s.logo, url: s.url }]
      : [];
  });
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export type FaqView = { id: number; category: FaqCategory; question: string; answer: string };

/** FAQs never fall back to another language: a question shows only where it is translated. */
export function listFaqs(locale: Locale, category?: FaqCategory): FaqView[] {
  const db = getDb();
  const where = category
    ? and(eq(faqs.published, true), eq(faqs.category, category))
    : eq(faqs.published, true);
  const rows = db.select().from(faqs).where(where).orderBy(asc(faqs.sortOrder), asc(faqs.id)).all();
  if (!rows.length) return [];
  const tr = db
    .select()
    .from(faqTranslations)
    .where(and(inArray(faqTranslations.faqId, rows.map((r) => r.id)), eq(faqTranslations.locale, locale)))
    .all();
  const byId = new Map(tr.map((t) => [t.faqId, t]));
  return rows.flatMap((f) => {
    const t = byId.get(f.id);
    return t ? [{ id: f.id, category: f.category, question: t.question, answer: t.answer }] : [];
  });
}

/* ------------------------------------------------------------------ */
/* Portfolio                                                           */
/* ------------------------------------------------------------------ */

export type CompanyView = {
  id: number;
  slug: string;
  sector: Sector;
  logo: string | null;
  website: string | null;
  year: number | null;
  name: string;
  summary: string;
  description: string | null;
  updatedAt: Date;
};

export function listCompanies(locale: Locale, sector?: Sector): CompanyView[] {
  const db = getDb();
  const where = sector
    ? and(eq(companies.published, true), eq(companies.sector, sector))
    : eq(companies.published, true);
  const rows = db.select().from(companies).where(where).orderBy(asc(companies.sortOrder), asc(companies.id)).all();
  if (!rows.length) return [];
  const tr = groupBy(
    db.select().from(companyTranslations).where(inArray(companyTranslations.companyId, rows.map((r) => r.id))).all(),
    (t) => t.companyId,
  );
  return rows.flatMap((c) => {
    const t = pickTranslation(tr.get(c.id) ?? [], locale);
    return t
      ? [
          {
            id: c.id,
            slug: c.slug,
            sector: c.sector,
            logo: c.logo,
            website: c.website,
            year: c.year,
            name: t.name,
            summary: t.summary,
            description: t.description,
            updatedAt: c.updatedAt,
          },
        ]
      : [];
  });
}

export function getCompany(slug: string, locale: Locale): CompanyView | undefined {
  return listCompanies(locale).find((c) => c.slug === slug);
}

export function countPublishedCompanies(): number {
  return getDb().select({ n: count() }).from(companies).where(eq(companies.published, true)).get()?.n ?? 0;
}

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

export type PostCard = {
  id: number;
  slug: string;
  category: PostCategory;
  coverImage: string | null;
  coverAlt: string | null;
  featured: boolean;
  publishedAt: Date;
  updatedAt: Date;
  title: string;
  excerpt: string;
  readingMinutes: number;
};

export type PostView = PostCard & {
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Locales this post is published in (for hreflang) */
  locales: Locale[];
};

function publishedWhere() {
  return and(eq(posts.status, 'published'), lte(posts.publishedAt, new Date()));
}

/** Posts only appear in locales they are translated into — no fallback. */
export function listPosts(
  locale: Locale,
  opts: { category?: PostCategory; limit?: number; offset?: number; excludeId?: number } = {},
): { items: PostCard[]; total: number } {
  const db = getDb();
  const where = and(
    publishedWhere(),
    eq(postTranslations.locale, locale),
    opts.category ? eq(posts.category, opts.category) : undefined,
  );
  const base = db
    .select({
      id: posts.id,
      slug: posts.slug,
      category: posts.category,
      coverImage: posts.coverImage,
      featured: posts.featured,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      trUpdatedAt: postTranslations.updatedAt,
      title: postTranslations.title,
      excerpt: postTranslations.excerpt,
      coverAlt: postTranslations.coverAlt,
      readingMinutes: postTranslations.readingMinutes,
    })
    .from(posts)
    .innerJoin(postTranslations, eq(postTranslations.postId, posts.id))
    .where(where);

  const total =
    db
      .select({ n: count() })
      .from(posts)
      .innerJoin(postTranslations, eq(postTranslations.postId, posts.id))
      .where(where)
      .get()?.n ?? 0;

  const rows = base
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(opts.limit ?? 12)
    .offset(opts.offset ?? 0)
    .all();

  const items = rows
    .filter((r) => r.id !== opts.excludeId)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      category: r.category,
      coverImage: r.coverImage,
      coverAlt: r.coverAlt,
      featured: r.featured,
      publishedAt: r.publishedAt ?? r.updatedAt,
      updatedAt: r.trUpdatedAt > r.updatedAt ? r.trUpdatedAt : r.updatedAt,
      title: r.title,
      excerpt: r.excerpt,
      readingMinutes: r.readingMinutes,
    }));
  return { items, total };
}

export function getPost(slug: string, locale: Locale): PostView | undefined {
  const db = getDb();
  const post = db.select().from(posts).where(and(eq(posts.slug, slug), publishedWhere())).get();
  if (!post) return undefined;
  const trs = db.select().from(postTranslations).where(eq(postTranslations.postId, post.id)).all();
  const t = trs.find((x) => x.locale === locale);
  if (!t) return undefined;
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    coverImage: post.coverImage,
    coverAlt: t.coverAlt,
    featured: post.featured,
    publishedAt: post.publishedAt ?? post.createdAt,
    updatedAt: t.updatedAt > post.updatedAt ? t.updatedAt : post.updatedAt,
    title: t.title,
    excerpt: t.excerpt,
    readingMinutes: t.readingMinutes,
    body: t.body,
    seoTitle: t.seoTitle,
    seoDescription: t.seoDescription,
    locales: trs.map((x) => x.locale as Locale),
  };
}

/** For the sitemap / llms.txt: every published post with its locales. */
export function listPublishedPostIndex() {
  const db = getDb();
  const rows = db.select().from(posts).where(publishedWhere()).orderBy(desc(posts.publishedAt)).all();
  if (!rows.length) return [];
  const tr = groupBy(
    db.select().from(postTranslations).where(inArray(postTranslations.postId, rows.map((r) => r.id))).all(),
    (t) => t.postId,
  );
  return rows.map((p) => {
    const list = tr.get(p.id) ?? [];
    return {
      slug: p.slug,
      category: p.category,
      updatedAt: list.reduce((m, t) => (t.updatedAt > m ? t.updatedAt : m), p.updatedAt),
      translations: list.map((t) => ({ locale: t.locale as Locale, title: t.title, excerpt: t.excerpt })),
    };
  });
}
