import type { MetadataRoute } from 'next';
import { countPublishedCompanies, listCompanies, listPublishedPostIndex } from '@sabano/db';
import { locales, localeMeta, type Locale } from '@sabano/i18n';
import { pageUrl, serviceSlugs, staticPages } from '@/lib/site';

// Rendered per request (cheap SQLite reads) so builds never need a database.
export const dynamic = 'force-dynamic';

function alternates(path: string, available: readonly Locale[] = locales) {
  const languages: Record<string, string> = {};
  for (const l of available) languages[localeMeta[l].hreflang] = pageUrl(l, path);
  if (available.includes('fa')) languages['x-default'] = pageUrl('fa', path);
  return { languages };
}

const priority: Record<string, number> = { home: 1, services: 0.9, cooperation: 0.9, about: 0.8, investment: 0.8, process: 0.8, faq: 0.7, news: 0.7, contact: 0.7, leadership: 0.6, portfolio: 0.6, privacy: 0.2 };

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const hasPortfolio = countPublishedCompanies() > 0;

  for (const page of staticPages) {
    if (page.key === 'portfolio' && !hasPortfolio) continue;
    for (const l of locales) {
      entries.push({
        url: pageUrl(l, page.path),
        lastModified: now,
        changeFrequency: page.key === 'news' ? 'daily' : 'monthly',
        priority: priority[page.key] ?? 0.5,
        alternates: alternates(page.path),
      });
    }
  }
  for (const slug of serviceSlugs) {
    for (const l of locales) {
      entries.push({ url: pageUrl(l, `/services/${slug}`), lastModified: now, changeFrequency: 'monthly', priority: 0.85, alternates: alternates(`/services/${slug}`) });
    }
  }
  for (const post of listPublishedPostIndex()) {
    const available = post.translations.map((t) => t.locale);
    for (const l of available) {
      entries.push({ url: pageUrl(l, `/news/${post.slug}`), lastModified: post.updatedAt, changeFrequency: 'monthly', priority: 0.6, alternates: alternates(`/news/${post.slug}`, available) });
    }
  }
  if (hasPortfolio) {
    for (const c of listCompanies('fa')) {
      for (const l of locales) {
        entries.push({ url: pageUrl(l, `/portfolio/${c.slug}`), lastModified: c.updatedAt, changeFrequency: 'yearly', priority: 0.5, alternates: alternates(`/portfolio/${c.slug}`) });
      }
    }
  }
  return entries;
}
