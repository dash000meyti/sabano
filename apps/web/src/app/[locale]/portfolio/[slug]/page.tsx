import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@sabano/i18n';
import { buttonClasses } from '@sabano/ui';
import { ArrowUpRightIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/ui/Section';
import { areaAnims, areaIcons } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { getCompanyBySlug } from '@/lib/data';
import { localizeDigits } from '@/lib/format';
import { ORG_ID, webPageLd } from '@/lib/jsonld';
import type { LocaleSlugParams } from '@/lib/params';
import { buildMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: LocaleSlugParams): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const c = getCompanyBySlug(slug, locale);
  if (!c) return {};
  return buildMetadata({ locale, path: `/portfolio/${slug}`, title: c.name, description: c.summary, image: c.logo ?? undefined });
}

export default async function CompanyPage({ params }: LocaleSlugParams) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const c = getCompanyBySlug(slug, locale);
  if (!c) notFound();
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tsec = await getTranslations({ locale, namespace: 'sectors' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: `/portfolio/${slug}`, name: c.name, description: c.summary }),
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: c.name,
            description: c.description ?? c.summary,
            ...(c.website ? { url: c.website } : {}),
            ...(c.logo ? { logo: c.logo } : {}),
            funder: { '@id': ORG_ID },
          },
        ]}
      />
      <PageHero
        locale={locale}
        crumbs={[
          { label: tn('portfolio'), href: '/portfolio' },
          { label: c.name, href: `/portfolio/${slug}` },
        ]}
        kicker={tsec(c.sector)}
        icon={areaIcons[c.sector]}
        anim={areaAnims[c.sector]}
        title={c.name}
        lead={c.summary}
        compact
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="prose-sabano whitespace-pre-line">{c.description ?? c.summary}</div>
          <aside className="h-fit space-y-5 rounded-3xl border border-edge bg-canvas-alt p-7">
            {c.logo && (
              <div className="grid h-28 place-items-center rounded-2xl bg-card">
                <Image src={c.logo} alt={c.name} width={180} height={80} className="max-h-20 w-auto object-contain" />
              </div>
            )}
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-fg-muted">{t('sector')}</dt>
                <dd className="mt-1 font-bold text-fg">{tsec(c.sector)}</dd>
              </div>
              {c.year && (
                <div>
                  <dt className="text-fg-muted">{t('year')}</dt>
                  <dd className="mt-1 font-bold text-fg">{localizeDigits(c.year, locale)}</dd>
                </div>
              )}
            </dl>
            {c.website && (
              <a href={c.website} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline', 'sm', 'w-full')}>
                {t('website')}
                <ArrowUpRightIcon className="size-4 rtl:-scale-x-100" aria-hidden />
                <span className="sr-only">{tc('newTab')}</span>
              </a>
            )}
            <Link href="/portfolio" className="block text-center text-sm font-bold text-accent">
              {t('back')}
            </Link>
          </aside>
        </div>
      </Section>
      <CtaBand title={t('empty.cta')} text={t('empty.text')} primary={{ href: '/cooperation', label: tc('submitProposal') }} />
    </>
  );
}
