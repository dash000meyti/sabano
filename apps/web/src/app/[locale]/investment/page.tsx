import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cn } from '@sabano/ui';
import { RocketLaunchIcon, WarningIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { IconTile, Section, SectionHeader } from '@/components/ui/Section';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { areaAnims, areaIcons, criteriaIcons } from '@/components/visual-maps';
import { localizeDigits } from '@/lib/format';
import { itemListLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { areaImages, areaKeys, pageUrl } from '@/lib/site';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'investment.meta' });
  return buildMetadata({ locale, path: '/investment', title: t('title'), description: t('description'), image: ogImageFor(locale, 'investment') });
}

export default async function InvestmentPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'investment' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const criteria = t.raw('criteria.items') as { title: string; text: string }[];
  const n2 = (n: number) => localizeDigits(String(n).padStart(2, '0'), locale);

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/investment', name: t('meta.title'), description: t('meta.description') }),
          itemListLd(areaKeys.map((k) => ({ name: t(`areas.${k}.title`), description: t(`areas.${k}.text`), url: `${pageUrl(locale, '/investment')}#${k}` }))),
        ]}
      />
      <PageHero
        locale={locale}
        crumbs={[{ label: tn('investmentAreas'), href: '/investment' }]}
        kicker={t('hero.kicker')}
        icon={RocketLaunchIcon}
        anim="rise"
        title={t('hero.title')}
        lead={t('hero.lead')}
        image={{ src: '/images/topics/future.jpg', alt: '' }}
        highlight={2}
      />

      <Section tone="dark" aurora={false} labelledBy="areas-title">
        <SectionHeader id="areas-title" title={t('areasTitle')} tone="light" highlight={2} />
        <div className="mt-16 space-y-8">
          {areaKeys.map((key, i) => {
            const Icon = areaIcons[key];
            const examples = t.raw(`areas.${key}.examples`) as string[];
            return (
              <article key={key} id={key} className="group border-gradient grid scroll-mt-28 overflow-hidden rounded-[2.25rem] bg-card lg:grid-cols-2" data-reveal>
                <div className={cn('scheme-dark relative min-h-72 overflow-hidden lg:min-h-[26rem]', i % 2 === 1 && 'lg:order-2')}>
                  <Image
                    src={areaImages[key]}
                    alt={t(`areas.${key}.title`)}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/10 to-transparent" />
                  <span className="text-gold absolute bottom-6 start-7 text-7xl font-black">{n2(i + 1)}</span>
                </div>
                <div className="relative flex flex-col justify-center p-6 sm:p-12 lg:p-14">
                  <IconTile icon={Icon} anim={areaAnims[key]} size="xl" shape="circle" />
                  <h3 className="mt-7 text-[clamp(1.6rem,1.2rem+1.2vw,2.3rem)] font-black text-fg">{t(`areas.${key}.title`)}</h3>
                  <p className="mt-4 text-[1.04rem] leading-8 text-fg-muted">{t(`areas.${key}.text`)}</p>
                  <p className="mt-8 text-xs font-bold text-accent">{t('examplesLabel')}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {examples.map((e) => (
                      <li key={e} className="rounded-full border border-edge bg-card-hover px-4 py-1.5 text-sm font-semibold text-fg/85">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="surface" labelledBy="criteria-title">
        <SectionHeader id="criteria-title" title={t('criteria.title')} align="center" highlight={2} />
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {criteria.map((c, i) => (
            <li key={c.title} data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
              <div className="group spotlight relative h-full overflow-hidden rounded-[1.75rem] border border-edge bg-card p-7 shadow-card transition-transform duration-500 hover:-translate-y-1.5">
                <span aria-hidden className="text-outline pointer-events-none absolute -top-4 end-3 text-[5.5rem] font-black leading-none">
                  {n2(i + 1)}
                </span>
                <IconTile icon={(criteriaIcons[i] ?? criteriaIcons[0]!).icon} anim={(criteriaIcons[i] ?? criteriaIcons[0]!).anim} tone="gold" shape="diamond" className="z-[1]" />
                <h3 className="relative z-[1] mt-6 text-lg font-black text-fg">{c.title}</h3>
                <p className="relative z-[1] mt-2 text-[0.9rem] leading-7 text-fg-muted">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-12 flex w-fit items-center gap-2.5 rounded-full border border-gold-edge bg-gold-soft px-5 py-2.5 text-sm text-fg" data-reveal>
          <AnimatedIcon icon={WarningIcon} anim="swing" className="shrink-0 text-gold-ink" iconClassName="size-5" />
          {t('disclaimer')}
        </p>
      </Section>

      <CtaBand title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.button') }} secondary={{ href: '/process', label: t('cta.secondary') }} />
    </>
  );
}
