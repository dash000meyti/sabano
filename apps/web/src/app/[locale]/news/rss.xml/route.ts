import { getTranslations } from 'next-intl/server';
import { listPosts } from '@sabano/db';
import { isLocale, localeMeta } from '@sabano/i18n';
import { absoluteUrl, pageUrl } from '@/lib/site';

// Rendered per request (cheap SQLite reads) so builds never need a database.
export const dynamic = 'force-dynamic';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response('Not found', { status: 404 });
  const t = await getTranslations({ locale, namespace: 'news' });
  const posts = listPosts(locale, { limit: 50 }).items;
  const self = pageUrl(locale, '/news/rss.xml');
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${pageUrl(locale, `/news/${p.slug}`)}</link>
      <guid isPermaLink="true">${pageUrl(locale, `/news/${p.slug}`)}</guid>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
      <category>${esc(t(`categories.${p.category}`))}</category>
      <description>${esc(p.excerpt)}</description>${p.coverImage ? `\n      <enclosure url="${esc(absoluteUrl(p.coverImage))}" type="image/jpeg" length="0" />` : ''}
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(t('meta.title'))}</title>
    <link>${pageUrl(locale, '/news')}</link>
    <description>${esc(t('meta.description'))}</description>
    <language>${localeMeta[locale].hreflang}</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
