import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cn } from '@sabano/ui';
import { Orbits } from '@/components/decor/Aurora';
import { CheckCircleIcon, HandCoinsIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { StepsTimeline } from '@/components/sections/StepsTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Section, SectionHeader } from '@/components/ui/Section';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { heroVisuals, serviceAnims, serviceIcons, stepIconsFor } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { localizeDigits } from '@/lib/format';
import { itemListLd, serviceLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { serviceSlugs } from '@/lib/site';

const legacyAnchors: Record<string, string> = { investment: 'investment-service', 'fund-agency': 'agency' };

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'services.meta' });
  return buildMetadata({ locale, path: '/services', title: t('title'), description: t('description'), image: ogImageFor(locale, 'services') });
}

export default async function ServicesPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'services' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const rows = t.raw('chooser.rows') as { need: string; slug: (typeof serviceSlugs)[number] }[];
  const steps = t.raw('steps') as { title: string; text: string }[];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/services', name: t('meta.title'), description: t('meta.description'), type: 'CollectionPage' }),
          itemListLd(
            serviceSlugs.map((s) => ({
              name: t(`items.${s}.title`),
              item: serviceLd({ locale, path: `/services/${s}`, name: t(`items.${s}.title`), description: t(`items.${s}.short`), serviceType: t(`items.${s}.title`), audience: t.raw(`items.${s}.whoFor`) as string[] }),
            })),
          ),
        ]}
      />
      <PageHero locale={locale} crumbs={[{ label: tn('services'), href: '/services' }]} kicker={t('hero.kicker')} icon={HandCoinsIcon} anim="float" visual={heroVisuals.services} title={t('hero.title')} lead={t('hero.lead')} highlight={2} />

      <Section tone="dark" aurora={false} labelledBy="list-title" className="pt-16 sm:pt-20 lg:pt-24">
        <h2 id="list-title" className="sr-only">
          {t('hero.title')}
        </h2>
        <ul className="grid gap-5 md:grid-cols-2">
          {serviceSlugs.map((slug, i) => {
            const Icon = serviceIcons[slug];
            const who = (t.raw(`items.${slug}.whoFor`) as string[]).slice(0, 2);
            const wide = i === 0;
            return (
              <li key={slug} id={slug} className={cn('scroll-mt-28', wide && 'md:col-span-2')} data-reveal style={{ '--reveal-delay': (i % 2) * 100 } as React.CSSProperties}>
                {legacyAnchors[slug] && <span id={legacyAnchors[slug]} className="block scroll-mt-28" />}
                <article className={cn('group spotlight border-gradient relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-card p-6 transition-colors duration-500 hover:bg-card-hover sm:p-10', wide && 'lg:flex-row lg:items-center lg:gap-14')}>
                  <span aria-hidden className="text-outline pointer-events-none absolute -bottom-8 end-6 text-[9rem] font-black leading-none">
                    {localizeDigits(String(i + 1).padStart(2, '0'), locale)}
                  </span>
                  {wide && <Orbits className="pointer-events-none absolute -end-32 -top-40 w-[30rem] opacity-30" />}
                  <div className={cn('relative z-[1]', wide && 'lg:w-1/2')}>
                    <IconTile icon={Icon} anim={serviceAnims[slug]} size={wide ? 'xl' : 'lg'} shape="hex" trigger={wide ? 'always' : 'hover'} />
                    <h3 className={cn('mt-7 font-black text-fg', wide ? 'text-[clamp(1.7rem,1.2rem+1.4vw,2.5rem)]' : 'text-2xl')}>
                      <Link href={`/services/${slug}`} className="after:absolute after:inset-0">
                        {t(`items.${slug}.title`)}
                      </Link>
                    </h3>
                    <p className={cn('mt-3 leading-8 text-fg-muted', wide && 'max-w-lg text-[1.05rem]')}>{t(`items.${slug}.short`)}</p>
                  </div>
                  <div className={cn('relative z-[1] mt-8', wide && 'lg:mt-0 lg:w-1/2')}>
                    <ul className="space-y-3 border-t border-edge pt-6 lg:border-t-0 lg:pt-0">
                      {who.map((w) => (
                        <li key={w} className="flex gap-3 text-[0.95rem] leading-7 text-fg/80">
                          <CheckCircleIcon weight="fill" className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
                          {w}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-accent">
                      {tc('learnMore')}
                      <span className="grid size-8 place-items-center rounded-full border border-edge transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-midnight">
                        <ForwardArrow className="size-3.5" />
                      </span>
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="surface" labelledBy="chooser-title">
        <SectionHeader id="chooser-title" title={t('chooser.title')} highlight={2} />
        <div className="mt-12 overflow-hidden rounded-[2rem] border border-edge bg-card shadow-lift" data-reveal>
          <table className="w-full border-collapse text-start text-[0.98rem]">
            <thead>
              <tr className="scheme-dark bg-night text-fg">
                <th scope="col" className="px-7 py-5 text-start text-sm font-bold text-fg-muted">
                  {t('chooser.need')}
                </th>
                <th scope="col" className="px-7 py-5 text-start text-sm font-bold text-fg-muted">
                  {t('chooser.service')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const Icon = serviceIcons[r.slug];
                return (
                  <tr key={r.slug} className="group border-t border-edge transition-colors hover:bg-accent-soft">
                    <td className="px-7 py-5 leading-8 text-fg">{r.need}</td>
                    <td className="px-7 py-5">
                      <Link href={`/services/${r.slug}`} className="inline-flex items-center gap-3 font-bold text-fg hover:text-accent">
                        <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent ring-1 ring-accent/20">
                          <AnimatedIcon icon={Icon} anim={serviceAnims[r.slug]} trigger="hover" iconClassName="size-5" />
                        </span>
                        {t(`items.${r.slug}.title`)}
                        <ForwardArrow />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section labelledBy="steps-title">
        <SectionHeader id="steps-title" title={t('labels.steps')} text={t('labels.note')} />
        <StepsTimeline locale={locale} steps={steps} icons={stepIconsFor(steps.length)} className="mt-14" />
      </Section>

      <CtaBand icon={HandCoinsIcon} anim="float" title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.button') }} secondary={{ href: '/process', label: tn('process') }} />
    </>
  );
}
