import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@sabano/i18n';
import { buttonClasses, cn } from '@sabano/ui';
import { CheckCircleIcon, FileTextIcon, SparkleIcon, UsersIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { PageHero } from '@/components/sections/PageHero';
import { StepsTimeline } from '@/components/sections/StepsTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Section } from '@/components/ui/Section';
import { serviceIcons } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { localizeDigits } from '@/lib/format';
import { faqLd, serviceLd, webPageLd } from '@/lib/jsonld';
import type { LocaleSlugParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { serviceSlugs, type ServiceSlug } from '@/lib/site';

function isService(slug: string): slug is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(slug);
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: LocaleSlugParams): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  if (!isService(slug)) return {};
  const t = await getTranslations({ locale, namespace: `services.items.${slug}` });
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: t('metaTitle'),
    description: t('metaDescription'),
    image: ogImageFor(locale, `service-${slug}`),
    absoluteTitle: true,
  });
}

export default async function ServicePage({ params }: LocaleSlugParams) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  if (!isService(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'services' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const base = `items.${slug}`;
  const whoFor = t.raw(`${base}.whoFor`) as string[];
  const benefits = t.raw(`${base}.benefits`) as string[];
  const documents = t.raw(`${base}.documents`) as string[];
  const faqs = t.raw(`${base}.faqs`) as { q: string; a: string }[];
  const steps = t.raw('steps') as { title: string; text: string }[];
  const Icon = serviceIcons[slug];
  const others = serviceSlugs.filter((s) => s !== slug);

  const toc = [
    { id: 'who', label: t('labels.whoFor') },
    { id: 'benefits', label: t('labels.benefits') },
    { id: 'documents', label: t('labels.documents') },
    { id: 'steps', label: t('labels.steps') },
    { id: 'faq', label: tc('faqTitle') },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: `/services/${slug}`, name: t(`${base}.metaTitle`), description: t(`${base}.metaDescription`) }),
          serviceLd({
            locale,
            path: `/services/${slug}`,
            name: t(`${base}.title`),
            description: t(`${base}.lead`),
            serviceType: t(`${base}.title`),
            audience: whoFor,
          }),
          faqLd(faqs, locale),
        ]}
      />
      <PageHero
        locale={locale}
        crumbs={[
          { label: tn('services'), href: '/services' },
          { label: t(`${base}.title`), href: `/services/${slug}` },
        ]}
        kicker={t('hero.kicker')}
        title={t(`${base}.title`)}
        lead={t(`${base}.lead`)}
        aside={
          <div className="glass-card relative hidden rounded-[1.75rem] p-7 lg:block" data-reveal>
            <IconTile tone="gold" size="lg">
              <Icon weight="duotone" aria-hidden />
            </IconTile>
            <p className="mt-5 text-[0.95rem] leading-8 text-white/80">{t(`${base}.short`)}</p>
            <Link href="/cooperation" className={buttonClasses('gold', 'md', 'mt-6 w-full')}>
              {t('labels.request')}
              <ForwardArrow />
            </Link>
          </div>
        }
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-16">
            <section id="who" aria-labelledby="who-title" className="scroll-mt-28">
              <h2 id="who-title" className="flex items-center gap-3 text-2xl font-extrabold text-navy-900" data-reveal>
                <UsersIcon weight="duotone" className="size-7 text-teal-600" aria-hidden />
                {t('labels.whoFor')}
              </h2>
              <ul className="mt-6 grid gap-3">
                {whoFor.map((w) => (
                  <li key={w} className="flex gap-3 rounded-2xl border border-line bg-white p-5 text-[0.98rem] leading-8 text-navy-800" data-reveal>
                    <CheckCircleIcon weight="fill" className="mt-1.5 size-5 shrink-0 text-teal-500" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </section>

            <section id="benefits" aria-labelledby="benefits-title" className="scroll-mt-28">
              <h2 id="benefits-title" className="flex items-center gap-3 text-2xl font-extrabold text-navy-900" data-reveal>
                <SparkleIcon weight="duotone" className="size-7 text-gold-500" aria-hidden />
                {t('labels.benefits')}
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {benefits.map((b, i) => (
                  <li
                    key={b}
                    className={cn(
                      'relative overflow-hidden rounded-3xl p-6 text-[0.95rem] font-semibold leading-8',
                      i === 0 ? 'bg-navy-mesh text-white shadow-lift' : 'border border-line bg-surface text-navy-900',
                    )}
                    data-reveal
                    style={{ '--reveal-delay': i * 80 } as React.CSSProperties}
                  >
                    <span className={cn('mb-3 block text-3xl font-black', i === 0 ? 'text-gradient-gold' : 'text-gradient-teal')}>
                      {localizeDigits(String(i + 1).padStart(2, '0'), locale)}
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </section>

            <section id="documents" aria-labelledby="documents-title" className="scroll-mt-28">
              <h2 id="documents-title" className="flex items-center gap-3 text-2xl font-extrabold text-navy-900" data-reveal>
                <FileTextIcon weight="duotone" className="size-7 text-teal-600" aria-hidden />
                {t('labels.documents')}
              </h2>
              <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                {documents.map((d) => (
                  <li key={d} className="flex items-start gap-3 rounded-2xl border border-dashed border-teal-300 bg-teal-50/40 p-5 text-[0.95rem] leading-7 text-navy-800" data-reveal>
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 border-teal-500">
                      <span className="size-2 rounded-sm bg-teal-500" />
                    </span>
                    {d}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-muted">{t('labels.note')}</p>
            </section>

            <section id="steps" aria-labelledby="steps-title" className="scroll-mt-28">
              <h2 id="steps-title" className="text-2xl font-extrabold text-navy-900" data-reveal>
                {t('labels.steps')}
              </h2>
              <StepsTimeline locale={locale} steps={steps} orientation="vertical" className="mt-8" />
            </section>

            <section id="faq" aria-labelledby="faq-title" className="scroll-mt-28">
              <h2 id="faq-title" className="text-2xl font-extrabold text-navy-900" data-reveal>
                {tc('faqTitle')}
              </h2>
              <FaqAccordion items={faqs} className="mt-6" />
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <nav aria-label={tc('onThisPage')} className="rounded-3xl border border-line bg-white p-6">
                <p className="text-sm font-extrabold text-navy-900">{tc('onThisPage')}</p>
                <ul className="mt-4 space-y-1 border-s border-line">
                  {toc.map((x) => (
                    <li key={x.id}>
                      <a href={`#${x.id}`} className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 text-sm text-muted transition-colors hover:border-teal-500 hover:text-navy-900">
                        {x.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="rounded-3xl bg-navy-mesh p-6 text-white shadow-lift">
                <p className="text-sm font-extrabold">{tc('needHelp')}</p>
                <p className="mt-2 text-sm leading-7 text-white/70">{t('cta.text')}</p>
                <Link href="/cooperation" className={buttonClasses('gold', 'sm', 'mt-5 w-full')}>
                  {t('labels.request')}
                </Link>
              </div>
              <nav aria-label={t('labels.other')} className="rounded-3xl border border-line bg-surface p-6">
                <p className="text-sm font-extrabold text-navy-900">{t('labels.other')}</p>
                <ul className="mt-3 space-y-1">
                  {others.map((s) => {
                    const OIcon = serviceIcons[s];
                    return (
                      <li key={s}>
                        <Link href={`/services/${s}`} className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-semibold text-navy-800 transition-colors hover:bg-white">
                          <OIcon weight="duotone" className="size-5 text-teal-600" aria-hidden />
                          {t(`items.${s}.title`)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </Section>

      {/* Other services (mobile + desktop) */}
      <Section tone="surface" className="py-16 sm:py-20 lg:hidden">
        <h2 className="text-xl font-extrabold text-navy-900">{t('labels.other')}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {others.map((s) => {
            const OIcon = serviceIcons[s];
            return (
              <li key={s}>
                <Link href={`/services/${s}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-bold text-navy-900">
                  <OIcon weight="duotone" className="size-6 text-teal-600" aria-hidden />
                  {t(`items.${s}.title`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <CtaBand title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('labels.request') }} secondary={{ href: '/contact', label: tc('contactUs') }} />
    </>
  );
}
