import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses } from '@sabano/ui';
import { SignalRows } from '@/components/decor/DataLines';
import { BuildingsIcon, SealCheckIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { FactsGrid } from '@/components/sections/FactsGrid';
import { PageHero } from '@/components/sections/PageHero';
import { PartnersGrid } from '@/components/sections/PartnersGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Kicker, Section, SectionHeader } from '@/components/ui/Section';
import { valueIcons } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { getContact, getOrg, getPartners, getPeople, getShareholders, getSocial } from '@/lib/data';
import { organizationLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { areaKeys, pageUrl, serviceSlugs } from '@/lib/site';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'about.meta' });
  return buildMetadata({ locale, path: '/about', title: t('title'), description: t('description'), image: ogImageFor(locale, 'about') });
}

export default async function AboutPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const ts = await getTranslations({ locale, namespace: 'services' });
  const tsec = await getTranslations({ locale, namespace: 'sectors' });
  const values = t.raw('values.items') as { title: string; text: string }[];
  const shareholders = getShareholders(locale);
  const partners = getPartners(locale);
  const people = getPeople(locale);

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/about', name: t('meta.title'), description: t('meta.description'), type: 'AboutPage' }),
          organizationLd({
            locale,
            name: tc('orgName'),
            description: t('hero.lead'),
            contact: getContact(),
            social: getSocial(),
            org: getOrg(),
            services: serviceSlugs.map((s) => ({ name: ts(`items.${s}.title`), url: pageUrl(locale, `/services/${s}`) })),
            knowsAbout: areaKeys.map((a) => tsec(a)),
          }),
        ]}
      />
      <PageHero
        locale={locale}
        crumbs={[{ label: tn('about'), href: '/about' }]}
        kicker={t('hero.kicker')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        image={{ src: '/images/about/office.jpg', alt: '' }}
      />

      {/* What + mission */}
      <Section labelledBy="what-title">
        <div className="grid gap-14 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <div data-reveal>
            <Kicker>{tn('aboutOverview')}</Kicker>
            <h2 id="what-title" className="mt-3 text-[clamp(1.6rem,1.2rem+1.5vw,2.3rem)] font-extrabold text-navy-900">
              {t('what.title')}
            </h2>
            <p className="mt-5 text-[1.03rem] leading-9 text-muted">{t('what.text')}</p>
            <h2 className="mt-12 text-[clamp(1.4rem,1.1rem+1.2vw,2rem)] font-extrabold text-navy-900">{t('mission.title')}</h2>
            <p className="mt-4 text-[1.03rem] leading-9 text-muted">{t('mission.text')}</p>
          </div>
          <aside
            className="relative overflow-hidden rounded-[2rem] bg-navy-mesh p-8 text-white shadow-lift sm:p-10"
            data-reveal
            style={{ '--reveal-delay': 120 } as React.CSSProperties}
            aria-labelledby="horizon-title"
          >
            <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
            <SignalRows className="absolute -bottom-3 end-3 w-36 opacity-25" rows={7} />
            <h2 id="horizon-title" className="relative text-sm font-bold text-teal-300">
              {t('horizon.title')}
            </h2>
            <p className="relative mt-5 flex items-baseline gap-3">
              <span className="text-gradient-gold text-6xl font-black leading-none">{t('horizon.value')}</span>
              <span className="text-lg font-bold">{t('horizon.unit')}</span>
            </p>
            <p className="relative mt-2 text-sm text-white/65">{t('horizon.label')}</p>
            <div className="hairline-gold relative my-7" />
            <p className="relative text-[0.95rem] leading-8 text-white/80">{t('horizon.text')}</p>
          </aside>
        </div>
      </Section>

      {/* Values */}
      <Section tone="surface" labelledBy="values-title">
        <SectionHeader id="values-title" title={t('values.title')} align="center" />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {values.map((v, i) => {
            const Icon = valueIcons[i]!;
            return (
              <li key={v.title} className="rounded-3xl border border-line bg-white p-8 shadow-card" data-reveal style={{ '--reveal-delay': i * 90 } as React.CSSProperties}>
                <IconTile>
                  <Icon weight="duotone" aria-hidden />
                </IconTile>
                <h3 className="mt-6 text-lg font-extrabold text-navy-900">{v.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-8 text-muted">{v.text}</p>
              </li>
            );
          })}
        </ul>
        <FactsGrid locale={locale} className="mt-14" />
      </Section>

      {/* Shareholders */}
      <Section id="shareholders" labelledBy="shareholders-title">
        <SectionHeader id="shareholders-title" kicker={t('shareholders.kicker')} title={t('shareholders.title')} text={t('shareholders.text')} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shareholders.map((s, i) => (
            <li
              key={s.id}
              data-reveal
              style={{ '--reveal-delay': i * 80 } as React.CSSProperties}
              className={
                s.isMain
                  ? 'relative overflow-hidden rounded-3xl bg-navy-mesh p-7 text-white shadow-lift sm:col-span-2 lg:col-span-1'
                  : 'rounded-3xl border border-line bg-white p-7'
              }
            >
              {s.isMain && <div className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-gold-400/25 blur-2xl" />}
              <IconTile tone={s.isMain ? 'gold' : 'light'} size="sm">
                {s.isMain ? <SealCheckIcon weight="fill" aria-hidden /> : <BuildingsIcon weight="duotone" aria-hidden />}
              </IconTile>
              <p className={`mt-5 text-xs font-bold ${s.isMain ? 'text-gold-300' : 'text-muted'}`}>
                {s.isMain ? t('shareholders.main') : t('shareholders.other')}
              </p>
              <h3 className={`mt-1.5 text-lg font-extrabold ${s.isMain ? 'text-white' : 'text-navy-900'}`}>{s.name}</h3>
            </li>
          ))}
        </ul>
      </Section>

      {/* Leadership teaser */}
      <Section tone="surface" labelledBy="leadership-title">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div data-reveal>
            <h2 id="leadership-title" className="text-[clamp(1.6rem,1.2rem+1.5vw,2.3rem)] font-extrabold text-navy-900">
              {t('leadership.title')}
            </h2>
            <p className="mt-4 text-[1.03rem] leading-9 text-muted">{t('leadership.text')}</p>
            <Link href="/leadership" className={buttonClasses('primary', 'md', 'mt-8')}>
              {t('leadership.cta')}
              <ForwardArrow />
            </Link>
          </div>
          <ul className="flex flex-wrap gap-4 lg:justify-end" data-reveal>
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-full border border-line bg-white py-2 pe-5 ps-2 shadow-card">
                <span className="relative size-12 overflow-hidden rounded-full bg-navy-100">
                  {p.photo ? (
                    <Image src={p.photo} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center bg-navy-mesh text-base font-black text-gold-300">{p.name.slice(0, 1)}</span>
                  )}
                </span>
                <span>
                  <span className="block text-sm font-bold text-navy-900">{p.name}</span>
                  <span className="block text-xs text-muted">{p.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {partners.length > 0 && (
        <Section labelledBy="eco-title">
          <SectionHeader id="eco-title" title={t('ecosystem.title')} align="center" />
          <div className="mt-12">
            <PartnersGrid partners={partners} newTab={tc('newTab')} />
          </div>
        </Section>
      )}

      <CtaBand title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.button') }} secondary={{ href: '/contact', label: tc('contactUs') }} />
    </>
  );
}
