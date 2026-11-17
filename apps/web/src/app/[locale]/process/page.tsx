import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses } from '@sabano/ui';
import {
  CheckCircleIcon,
  ClockIcon,
  ListChecksIcon,
  PaperPlaneTiltIcon,
  SignpostIcon,
  WarningIcon,
} from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { StepsTimeline } from '@/components/sections/StepsTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { Aurora } from '@/components/decor/Aurora';
import { IconTile, Section, SectionHeader } from '@/components/ui/Section';
import { heroVisuals, processStepIcons } from '@/components/visual-maps';
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
        icon={SignpostIcon}
        anim="swing"
        visual={heroVisuals.process}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />

      <Section labelledBy="steps-title">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader id="steps-title" title={t('stepsTitle')} highlight={2} />
            <StepsTimeline locale={locale} steps={steps} orientation="vertical" icons={processStepIcons} className="mt-10" stepLabel={(n) => t('stepLabel', { n })} />
            <p className="mt-6 text-sm text-fg-muted">{t('note')}</p>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start lg:pt-20">
            <section aria-labelledby="prepare-title" className="scheme-dark grain border-glow relative isolate overflow-hidden rounded-[2rem] bg-night p-6 text-fg shadow-lift sm:p-9" data-reveal>
              <Aurora intensity={0.9} />
              <h2 id="prepare-title" className="flex items-center gap-3.5 text-xl font-black">
                <IconTile icon={ListChecksIcon} anim="nod" trigger="always" tone="gold" size="sm" shape="blob" />
                {t('prepare.title')}
              </h2>
              <ul className="mt-6 space-y-3.5">
                {prepare.map((p) => (
                  <li key={p} className="flex gap-3 text-[0.93rem] leading-7 text-fg/85">
                    <CheckCircleIcon weight="fill" className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/news/how-to-prepare-an-investment-proposal" className="mt-6 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-gold-300 hover:text-gold-200">
                {t('guide')}
                <ForwardArrow />
              </Link>
            </section>
            <section aria-labelledby="timing-title" className="spotlight overflow-hidden rounded-[2rem] border border-edge bg-card p-6 shadow-card sm:p-9" data-reveal>
              <h2 id="timing-title" className="relative z-[1] flex items-center gap-3.5 text-xl font-black text-fg">
                <IconTile icon={ClockIcon} anim="spin" trigger="always" size="sm" shape="circle" />
                {t('timing.title')}
              </h2>
              <p className="relative z-[1] mt-4 text-[0.98rem] leading-8 text-fg-muted">{t('timing.text')}</p>
            </section>
            <section aria-labelledby="mistakes-title" className="rounded-[2rem] border border-gold-edge bg-[linear-gradient(160deg,var(--gold-soft),var(--card))] p-6 sm:p-9" data-reveal>
              <h2 id="mistakes-title" className="flex items-center gap-3.5 text-xl font-black text-fg">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-ink ring-1 ring-gold-edge">
                  <AnimatedIcon icon={WarningIcon} anim="swing" iconClassName="size-5" />
                </span>
                {t('mistakes.title')}
              </h2>
              <ul className="mt-5 space-y-3">
                {mistakes.map((m) => (
                  <li key={m} className="flex gap-3 text-[0.93rem] leading-7 text-fg">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </section>
            <Link href="/cooperation" data-magnetic className={buttonClasses('gold', 'xl', 'w-full')}>
              {t('cta.button')}
              <ForwardArrow />
            </Link>
          </aside>
        </div>
      </Section>

      <CtaBand icon={PaperPlaneTiltIcon} anim="glide" title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.button') }} secondary={{ href: '/faq', label: tn('faq') }} />
    </>
  );
}
