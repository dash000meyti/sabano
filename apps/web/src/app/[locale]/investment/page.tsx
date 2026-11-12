import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cn } from '@sabano/ui';
import { CheckIcon, WarningIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { IconTile, Section, SectionHeader } from '@/components/ui/Section';
import { areaIcons } from '@/components/visual-maps';
import { itemListLd, webPageLd } from '@/lib/jsonld';
import { localizeDigits } from '@/lib/format';
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
        title={t('hero.title')}
        lead={t('hero.lead')}
        image={{ src: '/images/topics/future.jpg', alt: '' }}
      />

      <Section labelledBy="areas-title">
        <SectionHeader id="areas-title" title={t('areasTitle')} />
        <div className="mt-14 space-y-8">
          {areaKeys.map((key, i) => {
            const Icon = areaIcons[key];
            const examples = t.raw(`areas.${key}.examples`) as string[];
            return (
              <article
                key={key}
                id={key}
                className="group grid scroll-mt-28 overflow-hidden rounded-[2rem] border border-line bg-white shadow-card lg:grid-cols-2"
                data-reveal
              >
                <div className={cn('relative min-h-64 overflow-hidden lg:min-h-[22rem]', i % 2 === 1 && 'lg:order-2')}>
                  <Image
                    src={areaImages[key]}
                    alt={t(`areas.${key}.title`)}
                    fill
                    sizes="(min-width: 1024px) 620px, 100vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent" />
                  <span className="text-gradient-gold absolute bottom-5 start-6 text-6xl font-black opacity-90">
                    {localizeDigits(String(i + 1).padStart(2, '0'), locale)}
                  </span>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                  <IconTile>
                    <Icon weight="duotone" aria-hidden />
                  </IconTile>
                  <h3 className="mt-6 text-2xl font-extrabold text-navy-900">{t(`areas.${key}.title`)}</h3>
                  <p className="mt-3 text-[1rem] leading-8 text-muted">{t(`areas.${key}.text`)}</p>
                  <p className="mt-6 text-xs font-bold text-teal-700">{t('examplesLabel')}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {examples.map((e) => (
                      <li key={e} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-navy-800">
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

      <Section tone="navy" labelledBy="criteria-title">
        <SectionHeader id="criteria-title" title={t('criteria.title')} tone="light" />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {criteria.map((c, i) => (
            <li key={c.title} className="glass-card rounded-3xl p-6" data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
              <span className="grid size-9 place-items-center rounded-full bg-gold-400 text-navy-950">
                <CheckIcon weight="bold" className="size-4.5" aria-hidden />
              </span>
              <h3 className="mt-5 text-base font-extrabold">{c.title}</h3>
              <p className="mt-2 text-[0.88rem] leading-7 text-white/70">{c.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 flex items-center gap-2 text-sm text-white/65">
          <WarningIcon weight="duotone" className="size-5 shrink-0 text-gold-300" aria-hidden />
          {t('disclaimer')}
        </p>
      </Section>

      <CtaBand
        title={t('cta.title')}
        text={t('cta.text')}
        primary={{ href: '/cooperation', label: t('cta.button') }}
        secondary={{ href: '/process', label: t('cta.secondary') }}
      />
    </>
  );
}
