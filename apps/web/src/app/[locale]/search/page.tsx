import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@sabano/i18n';
import { MagnifyingGlassIcon } from '@/components/icons';
import { PageHero } from '@/components/sections/PageHero';
import { Section } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { localizeDigits } from '@/lib/format';
import { searchSite } from '@/lib/search';
import { buildMetadata } from '@/lib/seo';

// Reads searchParams (filters, pagination, query), so it is rendered per request.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'search.meta' });
  return buildMetadata({ locale, path: '/search', title: t('title'), description: t('description'), noindex: true });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const q = ((await searchParams).q ?? '').slice(0, 100);
  const t = await getTranslations({ locale, namespace: 'search' });
  const hits = q ? await searchSite(locale, q, 30) : [];
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t('title'), href: '/search' }]} kicker={t('title')} title={q ? `«${q}»` : t('title')} compact>
        <form action="" method="get" role="search" className="relative mt-8 max-w-xl">
          <MagnifyingGlassIcon weight="bold" className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-white/60" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className="h-14 w-full rounded-full border border-white/20 bg-white/10 ps-13 pe-5 text-white outline-none backdrop-blur placeholder:text-white/50 focus:border-gold-400"
          />
        </form>
      </PageHero>
      <Section>
        {q ? (
          <>
            <p className="text-sm text-muted">{t('results', { count: localizeDigits(hits.length, locale), q })}</p>
            {hits.length === 0 ? (
              <p className="mt-8 rounded-3xl border border-dashed border-line p-10 text-center text-muted">{t('noResults')}</p>
            ) : (
              <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-white">
                {hits.map((h) => (
                  <li key={h.href}>
                    <Link href={h.href} className="block p-6 transition-colors hover:bg-surface/60">
                      <span className="text-xs font-bold text-teal-700">{t(`types.${h.type}`)}</span>
                      <span className="mt-1 block text-lg font-extrabold text-navy-900">{h.title}</span>
                      <span className="mt-1 block text-sm leading-7 text-muted">{h.snippet}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-muted">{t('hint')}</p>
        )}
      </Section>
    </>
  );
}
