import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckCircleIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { StepsTimeline } from '@/components/sections/StepsTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Section, SectionHeader } from '@/components/ui/Section';
import { serviceIcons } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
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
              item: serviceLd({
                locale,
                path: `/services/${s}`,
                name: t(`items.${s}.title`),
                description: t(`items.${s}.short`),
                serviceType: t(`items.${s}.title`),
                audience: t.raw(`items.${s}.whoFor`) as string[],
              }),
            })),
          ),
        ]}
      />
      <PageHero locale={locale} crumbs={[{ label: tn('services'), href: '/services' }]} kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')} />

      <Section labelledBy="list-title">
        <h2 id="list-title" className="sr-only">
          {t('hero.title')}
        </h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {serviceSlugs.map((slug, i) => {
            const Icon = serviceIcons[slug];
            const who = (t.raw(`items.${slug}.whoFor`) as string[]).slice(0, 2);
            return (
              <li key={slug} id={slug} className="scroll-mt-28" data-reveal style={{ '--reveal-delay': (i % 2) * 90 } as React.CSSProperties}>
                {legacyAnchors[slug] && <span id={legacyAnchors[slug]} className="block scroll-mt-28" />}
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lift">
                  <div className="flex items-start gap-5">
                    <IconTile size="lg">
                      <Icon weight="duotone" aria-hidden />
                    </IconTile>
                    <div>
                      <h3 className="text-xl font-extrabold text-navy-900">
                        <Link href={`/services/${slug}`} className="after:absolute after:inset-0">
                          {t(`items.${slug}.title`)}
                        </Link>
                      </h3>
                      <p className="mt-2 text-[0.95rem] leading-8 text-muted">{t(`items.${slug}.short`)}</p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2.5 border-t border-line pt-6">
                    {who.map((w) => (
                      <li key={w} className="flex gap-2.5 text-[0.9rem] leading-7 text-navy-800">
                        <CheckCircleIcon weight="fill" className="mt-1 size-4.5 shrink-0 text-teal-500" aria-hidden />
                        {w}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700">
                    {tc('learnMore')}
                    <ForwardArrow className="transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
                  </span>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="surface" labelledBy="chooser-title">
        <SectionHeader id="chooser-title" title={t('chooser.title')} />
        <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-white shadow-card" data-reveal>
          <table className="w-full border-collapse text-start text-[0.95rem]">
            <thead className="bg-navy-900 text-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-start font-bold">
                  {t('chooser.need')}
                </th>
                <th scope="col" className="px-6 py-4 text-start font-bold">
                  {t('chooser.service')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-t border-line transition-colors hover:bg-surface/70">
                  <td className="px-6 py-4 leading-7 text-navy-800">{r.need}</td>
                  <td className="px-6 py-4">
                    <Link href={`/services/${r.slug}`} className="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-800">
                      {t(`items.${r.slug}.title`)}
                      <ForwardArrow />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section labelledBy="steps-title">
        <SectionHeader id="steps-title" title={t('labels.steps')} text={t('labels.note')} />
        <StepsTimeline locale={locale} steps={steps} className="mt-12" />
      </Section>

      <CtaBand title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.button') }} secondary={{ href: '/process', label: tn('process') }} />
    </>
  );
}
