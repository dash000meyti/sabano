import { localizedPath, type Locale } from '@sabano/i18n';

/** Canonical origin of the public site (no trailing slash). */
export const SITE_URL = (process.env.SITE_URL ?? 'https://sabano.ir').replace(/\/+$/, '');

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Absolute URL of a page in a given locale, e.g. pageUrl('en', '/about'). */
export function pageUrl(locale: Locale, path: string): string {
  const p = localizedPath(locale, path);
  return absoluteUrl(p === '/' ? '' : p) || SITE_URL;
}

export const serviceSlugs = ['guarantee', 'credit', 'investment', 'fund-agency', 'consulting'] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export const areaKeys = ['ai', 'fintech', 'digital', 'future'] as const;
export type AreaKey = (typeof areaKeys)[number];

export const areaImages: Record<AreaKey, string> = {
  ai: '/images/topics/ai.jpg',
  fintech: '/images/topics/fintech.jpg',
  digital: '/images/topics/digital.jpg',
  future: '/images/topics/future.jpg',
};

/** Static (non-DB) pages, used for the sitemap, search and llms.txt. */
export const staticPages = [
  { path: '/', key: 'home' },
  { path: '/about', key: 'about' },
  { path: '/leadership', key: 'leadership' },
  { path: '/services', key: 'services' },
  { path: '/investment', key: 'investment' },
  { path: '/process', key: 'process' },
  { path: '/portfolio', key: 'portfolio' },
  { path: '/news', key: 'news' },
  { path: '/faq', key: 'faq' },
  { path: '/cooperation', key: 'cooperation' },
  { path: '/contact', key: 'contact' },
  { path: '/privacy', key: 'privacy' },
] as const;
export type StaticPageKey = (typeof staticPages)[number]['key'];
