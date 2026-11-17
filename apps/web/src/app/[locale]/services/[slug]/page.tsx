import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses, cn } from '@sabano/ui';
import { CheckCircleIcon, ClipboardTextIcon, QuestionIcon, SignpostIcon, SparkleIcon, UsersThreeIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { PageHero } from '@/components/sections/PageHero';
import { StepsTimeline } from '@/components/sections/StepsTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { Aurora, Orbits } from '@/components/decor/Aurora';
import { IconTile, Section } from '@/components/ui/Section';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { serviceAnims, serviceIcons, stepIconsFor } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { localizeDigits } from '@/lib/format';
import { faqLd, serviceLd, webPageLd } from '@/lib/jsonld';
import { toLocale, type LocaleSlugParams } from '@/lib/params';
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
  const locale = toLocale(l);
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
  const locale = toLocale(l);
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
        icon={Icon}
        anim={serviceAnims[slug]}
        title={t(`${base}.title`)}
        lead={t(`${base}.lead`)}
        aside={
          <div data-tilt className="glass border-glow relative hidden overflow-hidden rounded-[2rem] p-8 lg:block" data-reveal="scale">
            <Orbits className="pointer-events-none absolute -end-24 -top-24 w-80 opacity-40" />
            <IconTile icon={Icon} anim={serviceAnims[slug]} tone="gold" size="xl" shape="blob" trigger="always" />
            <p className="relative mt-6 text-[1rem] leading-8 text-fg/80">{t(`${base}.short`)}</p>
            <Link href="/cooperation" data-magnetic className={buttonClasses('gold', 'lg', 'relative mt-7 w-full')}>
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
              <h2 id="who-title" className="flex items-center gap-4 text-[1.7rem] font-black text-fg" data-reveal>
                <IconTile icon={UsersThreeIcon} anim="nod" trigger="always" size="sm" shape="circle" />
                {t('labels.whoFor')}
              </h2>
              <ul className="mt-6 grid gap-3">
                {whoFor.map((w) => (
                  <li key={w} className="spotlight flex gap-3 overflow-hidden rounded-[1.4rem] border border-edge bg-card p-5 text-[0.98rem] leading-8 text-fg shadow-card" data-reveal>
                    <CheckCircleIcon weight="fill" className="mt-1.5 size-5 shrink-0 text-accent" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </section>

            <section id="benefits" aria-labelledby="benefits-title" className="scroll-mt-28">
              <h2 id="benefits-title" className="flex items-center gap-4 text-[1.7rem] font-black text-fg" data-reveal>
                <IconTile icon={SparkleIcon} anim="twinkle" trigger="always" size="sm" shape="blob" tone="gold" weight="fill" />
                {t('labels.benefits')}
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {benefits.map((b, i) => (
                  <li
                    key={b}
                    className={cn(
                      'relative overflow-hidden rounded-3xl p-6 text-[0.95rem] font-semibold leading-8',
                      i === 0 ? 'scheme-dark grain isolate bg-night text-fg shadow-lift' : 'spotlight border border-edge bg-card text-fg shadow-card',
                    )}
                    data-reveal
                    style={{ '--reveal-delay': i * 80 } as React.CSSProperties}
                  >
                    <span className={cn('relative z-[1] mb-4 block text-4xl font-black', i === 0 ? 'text-gold' : 'text-brand')}>
                      {localizeDigits(String(i + 1).padStart(2, '0'), locale)}
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </section>

            <section id="documents" aria-labelledby="documents-title" className="scroll-mt-28">
              <h2 id="documents-title" className="flex items-center gap-4 text-[1.7rem] font-black text-fg" data-reveal>
                <IconTile icon={ClipboardTextIcon} anim="nod" trigger="always" size="sm" shape="hex" />
                {t('labels.documents')}
              </h2>
              <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                {documents.map((d) => (
                  <li key={d} className="flex items-start gap-3 rounded-[1.4rem] border border-dashed border-accent/40 bg-accent-soft p-5 text-[0.95rem] leading-7 text-fg" data-reveal>
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 border-teal-500">
                      <span className="size-2 rounded-sm bg-teal-500" />
                    </span>
                    {d}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-fg-muted">{t('labels.note')}</p>
            </section>

            <section id="steps" aria-labelledby="steps-title" className="scroll-mt-28">
              <h2 id="steps-title" className="flex items-center gap-4 text-[1.7rem] font-black text-fg" data-reveal>
                <IconTile icon={SignpostIcon} anim="swing" trigger="always" size="sm" shape="diamond" />
                {t('labels.steps')}
              </h2>
              <StepsTimeline locale={locale} steps={steps} icons={stepIconsFor(steps.length)} orientation="vertical" className="mt-8" />
            </section>

            <section id="faq" aria-labelledby="faq-title" className="scroll-mt-28">
              <h2 id="faq-title" className="flex items-center gap-4 text-[1.7rem] font-black text-fg" data-reveal>
                <IconTile icon={QuestionIcon} anim="swing" trigger="always" size="sm" />
                {tc('faqTitle')}
              </h2>
              <FaqAccordion items={faqs} className="mt-6" />
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              <nav aria-label={tc('onThisPage')} className="rounded-[1.75rem] border border-edge bg-card p-6 shadow-card">
                <p className="text-sm font-extrabold text-fg">{tc('onThisPage')}</p>
                <ul className="mt-4 space-y-1 border-s border-edge">
                  {toc.map((x) => (
                    <li key={x.id}>
                      <a href={`#${x.id}`} className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 text-sm text-fg-muted transition-colors hover:border-teal-500 hover:text-fg">
                        {x.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="scheme-dark grain border-glow relative isolate overflow-hidden rounded-[1.75rem] bg-night p-7 text-fg shadow-lift">
                <Aurora intensity={0.9} />
                <p className="text-sm font-extrabold">{tc('needHelp')}</p>
                <p className="mt-2 text-sm leading-7 text-fg-muted">{t('cta.text')}</p>
                <Link href="/cooperation" className={buttonClasses('gold', 'md', 'mt-6 w-full')}>
                  {t('labels.request')}
                </Link>
              </div>
              <nav aria-label={t('labels.other')} className="rounded-[1.75rem] border border-edge bg-canvas-alt p-6">
                <p className="text-sm font-extrabold text-fg">{t('labels.other')}</p>
                <ul className="mt-3 space-y-1">
                  {others.map((s) => {
                    const OIcon = serviceIcons[s];
                    return (
                      <li key={s}>
                        <Link href={`/services/${s}`} className="group flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-semibold text-fg transition-colors hover:bg-card">
                          <AnimatedIcon icon={OIcon} anim={serviceAnims[s]} trigger="hover" className="text-accent" iconClassName="size-5" />
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
        <h2 className="text-xl font-extrabold text-fg">{t('labels.other')}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {others.map((s) => {
            const OIcon = serviceIcons[s];
            return (
              <li key={s}>
                <Link href={`/services/${s}`} className="group flex items-center gap-3 rounded-2xl border border-edge bg-card p-4 text-sm font-bold text-fg">
                  <AnimatedIcon icon={OIcon} anim={serviceAnims[s]} trigger="hover" className="text-accent" iconClassName="size-6" />
                  {t(`items.${s}.title`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <CtaBand icon={Icon} anim={serviceAnims[slug]} title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('labels.request') }} secondary={{ href: '/contact', label: tc('contactUs') }} />
    </>
  );
}
