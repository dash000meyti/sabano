import 'server-only';
import { getTranslations } from 'next-intl/server';
import { listFaqs, listPosts } from '@sabano/db';
import type { Locale } from '@sabano/i18n';
import { serviceSlugs, staticPages } from './site';

export type SearchHit = { type: 'page' | 'service' | 'post' | 'faq'; title: string; snippet: string; href: string };
type Entry = SearchHit & { haystackTitle: string; haystackBody: string };

/** Normalises Persian/Arabic letter variants, diacritics and spacing for matching. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[‌‏‎]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function buildIndex(locale: Locale): Promise<Entry[]> {
  const t = await getTranslations({ locale });
  const entries: Entry[] = [];
  const add = (e: SearchHit, body: string) =>
    entries.push({ ...e, haystackTitle: normalize(e.title), haystackBody: normalize(`${e.snippet} ${body}`) });

  for (const p of staticPages) {
    if (p.key === 'home') continue;
    const ns = p.key as string;
    if (!t.has(`${ns}.meta.title`)) continue;
    const lead = t.has(`${ns}.hero.lead`) ? t(`${ns}.hero.lead`, { email: 'info@sabano.ir' }) : t(`${ns}.meta.description`);
    add({ type: 'page', title: t(`${ns}.hero.title`), snippet: t(`${ns}.meta.description`), href: p.path }, lead);
  }
  for (const s of serviceSlugs) {
    const base = `services.items.${s}`;
    const faqs = (t.raw(`${base}.faqs`) as { q: string; a: string }[]).map((f) => `${f.q} ${f.a}`).join(' ');
    add({ type: 'service', title: t(`${base}.title`), snippet: t(`${base}.short`), href: `/services/${s}` }, `${t(`${base}.lead`)} ${faqs}`);
  }
  for (const f of listFaqs(locale)) {
    add({ type: 'faq', title: f.question, snippet: f.answer, href: `/faq#faq-${f.id}` }, '');
  }
  for (const post of listPosts(locale, { limit: 200 }).items) {
    add({ type: 'post', title: post.title, snippet: post.excerpt, href: `/news/${post.slug}` }, '');
  }
  return entries;
}

export async function searchSite(locale: Locale, query: string, limit = 8): Promise<SearchHit[]> {
  const q = normalize(query);
  if (q.length < 2) return [];
  const terms = q.split(' ').filter((w) => w.length > 1);
  if (!terms.length) return [];
  const index = await buildIndex(locale);
  const scored = index
    .map((e) => {
      let score = 0;
      for (const term of terms) {
        if (e.haystackTitle.includes(term)) score += 6;
        if (e.haystackBody.includes(term)) score += 2;
      }
      if (e.haystackTitle.includes(q)) score += 8;
      if (terms.some((term) => !e.haystackTitle.includes(term) && !e.haystackBody.includes(term))) score = Math.floor(score / 3);
      if (e.type === 'service') score += 1;
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map(({ e }) => ({ type: e.type, title: e.title, snippet: e.snippet.slice(0, 220), href: e.href }));
}
