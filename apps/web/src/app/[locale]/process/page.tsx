import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses } from '@sabano/ui';
import { CheckCircleIcon, ClockIcon, ListChecksIcon, WarningIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { StepsTimeline } from '@/components/sections/StepsTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { Section, SectionHeader } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { howToLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'process.meta' });
  return buildMetadata({ locale, path: '/process', title: t('title'), description: t('description'), image: ogImageFor(locale, 'process') });
}

export default async function ProcessPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'process' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const steps = t.raw('steps') as { title: string; text: string }[];
  const prepare = t.raw('prepare.items') as string[];
  const mistakes = t.raw('mistakes.items') as string[];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/process', name: t('meta.title'), description: t('meta.description') }),
          howToLd({ locale, path: '/process', name: t('hero.title'), description: t('hero.lead'), steps, supplies: prepare }),
        ]}
      />
      <PageHero
        locale={locale}
        crumbs={[
          { label: tn('investment'), href: '/investment' },
          { label: tn('process'), href: '/process' },
        ]}
        kicker={t('hero.kicker')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />

      <Section labelledBy="steps-title">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader id="steps-title" title={t('stepsTitle')} />
            <StepsTimeline locale={locale} steps={steps} orientation="vertical" className="mt-10" stepLabel={(n) => t('stepLabel', { n })} />
            <p className="mt-6 text-sm text-muted">{t('note')}</p>
          </div>
          <aside className="space-y-6 lg:pt-20">
            <section aria-labelledby="prepare-title" className="rounded-[1.75rem] bg-navy-mesh p-8 text-white shadow-lift" data-reveal>
              <h2 id="prepare-title" className="flex items-center gap-3 text-lg font-extrabold">
                <ListChecksIcon weight="duotone" className="size-7 text-gold-300" aria-hidden />
                {t('prepare.title')}
              </h2>
              <ul className="mt-6 space-y-3.5">
                {prepare.map((p) => (
                  <li key={p} className="flex gap-3 text-[0.93rem] leading-7 text-white/85">
                    <CheckCircleIcon weight="fill" className="mt-1 size-5 shrink-0 text-teal-400" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/news/how-to-prepare-an-investment-proposal" className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-gold-300 hover:text-gold-200">
                {t('guide')}
                <ForwardArrow />
              </Link>
            </section>
            <section aria-labelledby="timing-title" className="rounded-[1.75rem] border border-line bg-white p-8 shadow-card" data-reveal>
              <h2 id="timing-title" className="flex items-center gap-3 text-lg font-extrabold text-navy-900">
                <ClockIcon weight="duotone" className="size-7 text-teal-600" aria-hidden />
                {t('timing.title')}
              </h2>
              <p className="mt-4 text-[0.95rem] leading-8 text-muted">{t('timing.text')}</p>
            </section>
            <section aria-labelledby="mistakes-title" className="rounded-[1.75rem] border border-gold-200 bg-gold-50 p-8" data-reveal>
              <h2 id="mistakes-title" className="flex items-center gap-3 text-lg font-extrabold text-navy-900">
                <WarningIcon weight="duotone" className="size-7 text-gold-600" aria-hidden />
                {t('mistakes.title')}
              </h2>
              <ul className="mt-5 space-y-3">
                {mistakes.map((m) => (
                  <li key={m} className="flex gap-3 text-[0.93rem] leading-7 text-navy-800">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </section>
            <Link href="/cooperation" className={buttonClasses('gold', 'lg', 'w-full')}>
              {t('cta.button')}
              <ForwardArrow />
            </Link>
          </aside>
        </div>
      </Section>

      <CtaBand title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.button') }} secondary={{ href: '/faq', label: tn('faq') }} />
    </>
  );
}
