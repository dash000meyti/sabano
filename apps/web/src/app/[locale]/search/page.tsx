import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MagnifyingGlassIcon } from '@/components/icons';
import { PageHero } from '@/components/sections/PageHero';
import { Section } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { localizeDigits } from '@/lib/format';
import { searchSite } from '@/lib/search';
import { buildMetadata } from '@/lib/seo';
import { toLocale } from '@/lib/params';

// Reads searchParams (filters, pagination, query), so it is rendered per request.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'search.meta' });
  return buildMetadata({ locale, path: '/search', title: t('title'), description: t('description'), noindex: true });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const locale = toLocale((await params).locale);
  setRequestLocale(locale);
  const q = ((await searchParams).q ?? '').slice(0, 100);
  const t = await getTranslations({ locale, namespace: 'search' });
  const hits = q ? await searchSite(locale, q, 30) : [];
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t('title'), href: '/search' }]} kicker={t('title')} icon={MagnifyingGlassIcon} anim="seek" title={q ? `«${q}»` : t('title')} compact>
        <form action="" method="get" role="search" className="relative mt-8 max-w-xl">
          <MagnifyingGlassIcon weight="bold" className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-fg-muted" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className="h-14 w-full rounded-full border border-edge-strong bg-tint ps-13 pe-5 text-fg outline-none backdrop-blur placeholder:text-fg-subtle focus:border-gold-400"
          />
        </form>
      </PageHero>
      <Section>
        {q ? (
          <>
            <p className="text-sm text-fg-muted">{t('results', { count: localizeDigits(hits.length, locale), q })}</p>
            {hits.length === 0 ? (
              <p className="mt-8 rounded-3xl border border-dashed border-edge p-10 text-center text-fg-muted">{t('noResults')}</p>
            ) : (
              <ul className="mt-6 divide-y divide-edge rounded-3xl border border-edge bg-card">
                {hits.map((h) => (
                  <li key={h.href}>
                    <Link href={h.href} className="block p-6 transition-colors hover:bg-canvas-alt/60">
                      <span className="text-xs font-bold text-accent">{t(`types.${h.type}`)}</span>
                      <span className="mt-1 block text-lg font-extrabold text-fg">{h.title}</span>
                      <span className="mt-1 block text-sm leading-7 text-fg-muted">{h.snippet}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-fg-muted">{t('hint')}</p>
        )}
      </Section>
    </>
  );
}
