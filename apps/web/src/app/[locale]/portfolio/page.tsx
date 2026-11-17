import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses } from '@sabano/ui';
import { Aurora, Orb, Orbits } from '@/components/decor/Aurora';
import { BriefcaseIcon, RocketLaunchIcon } from '@/components/icons';
import { heroVisuals } from '@/components/visual-maps';
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
        icon={BriefcaseIcon}
        anim="drop"
        visual={heroVisuals.portfolio}
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
          <div className="scheme-dark grain border-glow relative isolate mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] bg-night p-7 text-center text-fg shadow-lift sm:p-16" data-reveal="scale">
            <Aurora intensity={1} />
            <Orbits className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[40rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-35" />
            <Orb tone="gold" size={46} className="end-[12%] top-[16%] animate-float" />
            <IconTile icon={RocketLaunchIcon} anim="rise" trigger="always" tone="gold" size="xl" shape="blob" className="mx-auto" />
            <h2 className="text-gold mt-8 text-4xl font-black">{t('empty.title')}</h2>
            <p className="mx-auto mt-5 max-w-xl text-[1.04rem] leading-8 text-fg-muted">{t('empty.text')}</p>
            <Link href="/cooperation" data-magnetic className={buttonClasses('gold', 'xl', 'mt-10')}>
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
