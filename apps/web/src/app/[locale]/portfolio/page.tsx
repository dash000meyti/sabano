import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses } from '@sabano/ui';
import { SignalRows } from '@/components/decor/DataLines';
import { RocketLaunchIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { PortfolioGrid } from '@/components/sections/PortfolioGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Section } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { getCompanies } from '@/lib/data';
import { itemListLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { areaKeys, pageUrl } from '@/lib/site';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'portfolio.meta' });
  const empty = getCompanies(locale).length === 0;
  return buildMetadata({ locale, path: '/portfolio', title: t('title'), description: t('description'), image: ogImageFor(locale, 'portfolio'), noindex: empty });
}

export default async function PortfolioPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tsec = await getTranslations({ locale, namespace: 'sectors' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const companies = getCompanies(locale);

  return (
    <>
      {companies.length > 0 && (
        <JsonLd
          data={[
            webPageLd({ locale, path: '/portfolio', name: t('meta.title'), description: t('meta.description'), type: 'CollectionPage' }),
            itemListLd(companies.map((c) => ({ name: c.name, url: pageUrl(locale, `/portfolio/${c.slug}`), description: c.summary }))),
          ]}
        />
      )}
      <PageHero
        locale={locale}
        crumbs={[
          { label: tn('investment'), href: '/investment' },
          { label: tn('portfolio'), href: '/portfolio' },
        ]}
        kicker={t('hero.kicker')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />
      <Section>
        {companies.length > 0 ? (
          <PortfolioGrid
            companies={companies.map(({ id, slug, sector, logo, name, summary }) => ({ id, slug, sector, logo, name, summary }))}
            sectors={areaKeys.map((k) => ({ key: k, label: tsec(k) }))}
            allLabel={t('all')}
          />
        ) : (
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-line bg-surface p-10 text-center sm:p-14" data-reveal>
            <SignalRows className="absolute -end-4 top-6 w-32 opacity-20" />
            <IconTile size="lg" className="mx-auto">
              <RocketLaunchIcon weight="duotone" aria-hidden />
            </IconTile>
            <h2 className="mt-6 text-2xl font-extrabold text-navy-900">{t('empty.title')}</h2>
            <p className="mt-4 text-[1rem] leading-8 text-muted">{t('empty.text')}</p>
            <Link href="/cooperation" className={buttonClasses('gold', 'lg', 'mt-8')}>
              {t('empty.cta')}
              <ForwardArrow />
            </Link>
          </div>
        )}
      </Section>
      {companies.length > 0 && (
        <CtaBand title={t('empty.cta')} text={t('empty.text')} primary={{ href: '/cooperation', label: tc('submitProposal') }} />
      )}
    </>
  );
}
