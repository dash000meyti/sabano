import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PostCategory } from '@sabano/db';
import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { NewspaperIcon, PaperPlaneTiltIcon, RssIcon } from '@/components/icons';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { heroVisuals } from '@/components/visual-maps';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { PostCard } from '@/components/sections/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/lib/data';
import { localizeDigits } from '@/lib/format';
import { itemListLd, webPageLd } from '@/lib/jsonld';
import { buildMetadata, localizedPath, ogImageFor } from '@/lib/seo';
import { pageUrl } from '@/lib/site';

// Reads searchParams (filters, pagination, query), so it is rendered per request.
export const dynamic = 'force-dynamic';

const PER_PAGE = 9;
const categories: PostCategory[] = ['news', 'insight', 'guide'];

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

function parse(sp: { category?: string; page?: string }) {
  const category = categories.includes(sp.category as PostCategory) ? (sp.category as PostCategory) : undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  return { category, page };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const { category, page } = parse(await searchParams);
  const t = await getTranslations({ locale, namespace: 'news' });
  const meta = buildMetadata({ locale, path: '/news', title: t('meta.title'), description: t('meta.description'), image: ogImageFor(locale, 'news') });
  // Filtered / paginated variants are not separate documents for search engines.
  if (category || page > 1) return { ...meta, robots: { index: false, follow: true } };
  return meta;
}

export default async function NewsPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const { category, page } = parse(await searchParams);
  const t = await getTranslations({ locale, namespace: 'news' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const { items, total } = getPosts(locale, category, PER_PAGE, (page - 1) * PER_PAGE);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (c?: string, p?: number) => {
    const q = new URLSearchParams();
    if (c) q.set('category', c);
    if (p && p > 1) q.set('page', String(p));
    const s = q.toString();
    return s ? `/news?${s}` : '/news';
  };

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/news', name: t('meta.title'), description: t('meta.description'), type: 'CollectionPage' }),
          itemListLd(items.map((p) => ({ name: p.title, url: pageUrl(locale, `/news/${p.slug}`) }))),
        ]}
      />
      <PageHero locale={locale} crumbs={[{ label: tn('news'), href: '/news' }]} kicker={t('hero.kicker')} icon={NewspaperIcon} anim="tilt" visual={heroVisuals.news} title={t('hero.title')} lead={t('hero.lead')} />
      <Section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label={t('hero.kicker')} className="flex flex-wrap gap-2">
            {[undefined, ...categories].map((c) => (
              <Link
                key={c ?? 'all'}
                href={href(c)}
                aria-current={category === c ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                  category === c ? 'bg-fg text-canvas' : 'border border-edge bg-card text-fg hover:border-edge-strong',
                )}
              >
                {t(`categories.${c ?? 'all'}`)}
              </Link>
            ))}
          </nav>
          <a href={localizedPath(locale, '/news/rss.xml')} className="group inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-gold-ink hover:opacity-80">
            <AnimatedIcon icon={RssIcon} anim="beat" weight="bold" trigger="hover" iconClassName="size-4" />
            {t('rss')}
          </a>
        </div>

        {items.length === 0 ? (
          <p className="mt-16 rounded-3xl border border-dashed border-edge p-12 text-center text-fg-muted">{t('empty')}</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <div key={p.id} className={cn(i === 0 && page === 1 && !category && 'md:col-span-2 lg:col-span-3')}>
                <PostCard
                  post={p}
                  locale={locale}
                  featured={i === 0 && page === 1 && !category}
                  priority={i === 0}
                  categoryLabel={t(`categories.${p.category}`)}
                  minutesLabel={tc.raw('minutesRead') as string}
                />
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label={t('page', { page: localizeDigits(page, locale), total: localizeDigits(pages, locale) })} className="mt-12 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link href={href(category, page - 1)} rel="prev" className="rounded-full border border-edge px-5 py-2 text-sm font-bold text-fg hover:bg-canvas-alt">
                {t('prev')}
              </Link>
            )}
            <span className="text-sm text-fg-muted">{t('page', { page: localizeDigits(page, locale), total: localizeDigits(pages, locale) })}</span>
            {page < pages && (
              <Link href={href(category, page + 1)} rel="next" className="rounded-full border border-edge px-5 py-2 text-sm font-bold text-fg hover:bg-canvas-alt">
                {t('next')}
              </Link>
            )}
          </nav>
        )}
      </Section>
      <CtaBand icon={PaperPlaneTiltIcon} anim="glide" title={t('endCta.title')} text={t('endCta.text')} primary={{ href: '/cooperation', label: t('endCta.button') }} />
    </>
  );
}
