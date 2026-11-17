import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses, cn } from '@sabano/ui';
import { Aurora, Orbits } from '@/components/decor/Aurora';
import {
  BuildingOfficeIcon,
  BuildingsIcon,
  ChartPieSliceIcon,
  FlagBannerIcon,
  HandshakeIcon,
  InfoIcon,
  SealCheckIcon,
} from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { FactsGrid } from '@/components/sections/FactsGrid';
import { PageHero } from '@/components/sections/PageHero';
import { PartnersGrid } from '@/components/sections/PartnersGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Kicker, Section, SectionHeader } from '@/components/ui/Section';
import { Words } from '@/components/ui/Words';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { valueAnims, valueIcons } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { getContact, getOrg, getPartners, getPeople, getShareholders, getSocial } from '@/lib/data';
import { localizeDigits } from '@/lib/format';
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
      <PageHero locale={locale} crumbs={[{ label: tn('about'), href: '/about' }]} kicker={t('hero.kicker')} icon={BuildingOfficeIcon} anim="grow" title={t('hero.title')} lead={t('hero.lead')} image={{ src: '/images/about/office.jpg', alt: '' }} />

      {/* What + mission + horizon */}
      <Section labelledBy="what-title">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div data-reveal>
              <Kicker icon={InfoIcon} anim="pop">
                {tn('aboutOverview')}
              </Kicker>
            </div>
            <h2 id="what-title" className="mt-6 text-[clamp(1.9rem,1.2rem+2.4vw,3.2rem)] font-black leading-tight text-fg">
              <Words text={t('what.title')} />
            </h2>
            <p className="mt-6 text-[1.06rem] leading-9 text-fg-muted" data-reveal>
              {t('what.text')}
            </p>
            <div className="mt-12 rounded-[1.75rem] border border-edge bg-canvas-alt p-7" data-reveal>
              <h2 className="text-xl font-black text-fg">{t('mission.title')}</h2>
              <p className="mt-3 text-[1.02rem] leading-8 text-fg-muted">{t('mission.text')}</p>
            </div>
          </div>
          <aside className="scheme-dark grain border-glow relative isolate overflow-hidden rounded-[2.25rem] bg-night p-6 text-fg shadow-lift sm:p-12" data-reveal="scale" aria-labelledby="horizon-title">
            <Aurora intensity={1} variant="gold" />
            <Orbits className="pointer-events-none absolute -end-28 -top-28 -z-10 w-[26rem] opacity-40" />
            <h2 id="horizon-title" className="flex items-center gap-2.5 text-sm font-bold text-accent">
              <span className="grid size-9 place-items-center rounded-full bg-accent-soft ring-1 ring-accent/25">
                <AnimatedIcon icon={FlagBannerIcon} anim="wave" iconClassName="size-5" />
              </span>
              {t('horizon.title')}
            </h2>
            <p className="mt-6 flex items-baseline gap-3">
              <span className="text-gold tabular text-[clamp(4.5rem,3rem+5vw,7.5rem)] font-black leading-none" data-count>
                {t('horizon.value')}
              </span>
              <span className="text-xl font-black">{t('horizon.unit')}</span>
            </p>
            <p className="mt-3 text-sm text-fg-muted">{t('horizon.label')}</p>
            <div className="hairline-gold my-8" />
            <p className="text-[0.98rem] leading-8 text-fg-muted">{t('horizon.text')}</p>
          </aside>
        </div>
      </Section>

      {/* Values */}
      <Section tone="dark" labelledBy="values-title">
        <SectionHeader id="values-title" title={t('values.title')} tone="light" align="center" highlight={1} />
        <ul className="mt-16 grid gap-5 md:grid-cols-3">
          {values.map((v, i) => {
            const Icon = valueIcons[i]!;
            return (
              <li key={v.title} data-reveal style={{ '--reveal-delay': i * 100 } as React.CSSProperties}>
                <div className="group spotlight border-gradient relative h-full overflow-hidden rounded-[2rem] bg-card p-7 transition-transform duration-500 hover:-translate-y-1 sm:p-9">
                  <span aria-hidden className="text-outline pointer-events-none absolute -bottom-6 end-4 text-[7rem] font-black leading-none">
                    {localizeDigits(String(i + 1).padStart(2, '0'), locale)}
                  </span>
                  <IconTile icon={Icon} anim={valueAnims[i]} trigger="always" size="xl" shape={(['blob', 'hex', 'circle'] as const)[i]} />
                  <h3 className="relative z-[1] mt-8 text-2xl font-black">{v.title}</h3>
                  <p className="relative z-[1] mt-3 leading-8 text-fg-muted">{v.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <FactsGrid locale={locale} tone="dark" className="mt-16" />
      </Section>

      {/* Shareholders */}
      <Section id="shareholders" labelledBy="shareholders-title">
        <SectionHeader id="shareholders-title" kicker={t('shareholders.kicker')} icon={ChartPieSliceIcon} anim="spin" title={t('shareholders.title')} text={t('shareholders.text')} highlight={1} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shareholders.map((s, i) => (
            <li key={s.id} data-reveal style={{ '--reveal-delay': i * 90 } as React.CSSProperties} className={cn(s.isMain && 'sm:col-span-2 lg:col-span-1')}>
              <div
                className={cn(
                  'group relative grid h-full grid-cols-[auto_1fr] items-center gap-x-5 overflow-hidden rounded-[2rem] p-6 transition-transform duration-500 hover:-translate-y-1 sm:flex sm:flex-col sm:items-start sm:p-8',
                  s.isMain ? 'scheme-dark grain border-glow isolate bg-night text-fg shadow-lift' : 'spotlight border border-edge bg-card shadow-card',
                )}
              >
                {s.isMain && <Aurora intensity={0.9} variant="gold" />}
                {s.isMain ? (
                  <IconTile icon={SealCheckIcon} anim="beat" weight="fill" tone="gold" shape="blob" trigger="always" />
                ) : (
                  <IconTile icon={BuildingsIcon} anim="grow" shape="diamond" />
                )}
                <div className="relative z-[1] min-w-0 sm:mt-8">
                  <p className={cn('text-xs font-bold', s.isMain ? 'text-gold-300' : 'text-accent')}>{s.isMain ? t('shareholders.main') : t('shareholders.other')}</p>
                  <h3 className="mt-1.5 text-lg font-black leading-8 text-fg sm:mt-2 sm:text-xl">{s.name}</h3>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Leadership teaser */}
      <Section tone="surface" labelledBy="leadership-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 id="leadership-title" className="text-[clamp(1.9rem,1.2rem+2.4vw,3.2rem)] font-black text-fg">
              <Words text={t('leadership.title')} />
            </h2>
            <p className="mt-5 text-[1.05rem] leading-9 text-fg-muted" data-reveal>
              {t('leadership.text')}
            </p>
            <Link href="/leadership" data-magnetic className={buttonClasses('primary', 'lg', 'mt-9')} data-reveal>
              {t('leadership.cta')}
              <ForwardArrow />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4" data-reveal>
            {people.map((p, i) => (
              <li key={p.id} className={cn(i % 2 === 1 && 'translate-y-8')}>
                <Link href="/leadership" className="group scheme-dark relative block overflow-hidden rounded-[1.75rem] bg-navy-900 shadow-card">
                  <span className="relative block aspect-[4/5]">
                    {p.photo ? (
                      <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 280px, 45vw" className="object-cover grayscale-[30%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                    ) : (
                      <span className="grid size-full place-items-center bg-night">
                        <span className="text-gold text-6xl font-black">{p.name.slice(0, 1)}</span>
                      </span>
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/10 to-transparent" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-5 text-fg">
                    <span className="block text-base font-black">{p.name}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-gold-300">{p.role}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {partners.length > 0 && (
        <Section labelledBy="eco-title">
          <SectionHeader id="eco-title" title={t('ecosystem.title')} align="center" size="md" />
          <div className="mt-12">
            <PartnersGrid partners={partners} newTab={tc('newTab')} />
          </div>
        </Section>
      )}

      <CtaBand icon={HandshakeIcon} anim="nod" title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.button') }} secondary={{ href: '/contact', label: tc('contactUs') }} />
    </>
  );
}
