import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses, cn, containerClasses } from '@sabano/ui';
import { Aurora, Orb, Orbits } from '@/components/decor/Aurora';
import { Globe } from '@/components/decor/Globe';
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  ChatCenteredDotsIcon,
  CheckIcon,
  CompassIcon,
  FlagBannerIcon,
  HandCoinsIcon,
  HandshakeIcon,
  LightbulbIcon,
  NewspaperIcon,
  RocketLaunchIcon,
  SignpostIcon,
  SparkleIcon,
} from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { FactsGrid } from '@/components/sections/FactsGrid';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { PartnersMarquee } from '@/components/sections/PartnersGrid';
import { PostCard } from '@/components/sections/PostCard';
import { StepsTimeline } from '@/components/sections/StepsTimeline';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { Marquee } from '@/components/ui/Marquee';
import { IconTile, Kicker, Section, SectionHeader } from '@/components/ui/Section';
import { Words } from '@/components/ui/Words';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { areaAnims, areaIcons, pillarAnims, pillarIcons, processStepIcons, serviceAnims, serviceIcons, valueAnims, valueIcons } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { getCompanies, getContact, getFaqs, getOrg, getPartners, getPosts, getSocial, getStats } from '@/lib/data';
import { localizeDigits } from '@/lib/format';
import { organizationLd, webPageLd, websiteLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { areaImages, areaKeys, pageUrl, serviceSlugs } from '@/lib/site';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return buildMetadata({ locale, path: '/', title: t('title'), description: t('description'), image: ogImageFor(locale, 'home'), absoluteTitle: true });
}

const num = (n: number, locale: string) => localizeDigits(String(n).padStart(2, '0'), locale as 'fa');

export default async function HomePage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const ts = await getTranslations({ locale, namespace: 'services' });
  const ti = await getTranslations({ locale, namespace: 'investment' });
  const tp = await getTranslations({ locale, namespace: 'process' });
  const tn = await getTranslations({ locale, namespace: 'news' });
  const tf = await getTranslations({ locale, namespace: 'facts' });
  const tsec = await getTranslations({ locale, namespace: 'sectors' });
  const ta = await getTranslations({ locale, namespace: 'about' });

  const pillars = t.raw('pillars') as { title: string; text: string }[];
  const values = ta.raw('values.items') as { title: string; text: string }[];
  const steps = tp.raw('steps') as { title: string; text: string }[];
  const posts = getPosts(locale, undefined, 3).items;
  const faqs = getFaqs(locale).slice(0, 5);
  const partners = getPartners(locale);
  const companies = getCompanies(locale).slice(0, 8);
  const stats = getStats().filter((s) => s.label[locale] || s.label.en);
  const keywords = [...areaKeys.map((a) => tsec(a)), ...serviceSlugs.map((s) => ts(`items.${s}.title`))];
  const rtl = locale === 'fa';

  const orgLd = organizationLd({
    locale,
    name: tc('orgName'),
    description: t('meta.description'),
    contact: getContact(),
    social: getSocial(),
    org: getOrg(),
    services: serviceSlugs.map((s) => ({ name: ts(`items.${s}.title`), url: pageUrl(locale, `/services/${s}`) })),
    knowsAbout: areaKeys.map((a) => tsec(a)),
  });

  return (
    <>
      <JsonLd data={[orgLd, websiteLd(locale, tc('siteName'), t('meta.description')), webPageLd({ locale, path: '/', name: t('meta.title'), description: t('meta.description') })]} />

      {/* ============================================================ HERO */}
      <section className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-hero text-fg" aria-labelledby="hero-title">
        <Aurora intensity={1.1} />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial" />
        {/* Tehran skyline — local identity under the global story */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-[46%] md:block hero-skyline [mask-image:linear-gradient(to_top,#000_10%,transparent)]">
          <Image src="/images/hero/tehran.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom" />
        </div>

        <div className={cn(containerClasses, 'grid flex-1 items-center gap-6 pb-10 pt-32 sm:pt-36 lg:grid-cols-[1.2fr_0.95fr] lg:gap-8 lg:pt-28')}>
          <div className="relative z-[2]">
            <div data-intro>
              <Kicker>{t('hero.eyebrow')}</Kicker>
            </div>
            <h1 id="hero-title" className="mt-7 font-black leading-[1.08] tracking-tight">
              <Words mode="intro" text={t('hero.title1')} className="block text-[clamp(2.4rem,1rem+3.9vw,4.75rem)]" delay={120} wordClassName={() => 'text-sheen'} />
              <Words mode="intro" text={t('hero.title2')} className="block pb-3 text-[clamp(2.4rem,1rem+3.9vw,4.75rem)]" delay={360} wordClassName={() => 'text-gold animate-shimmer'} />
            </h1>
            <p className="mt-6 max-w-xl text-[1.08rem] leading-8 text-fg-muted sm:text-xl sm:leading-9" data-intro style={{ '--reveal-delay': 600 } as React.CSSProperties}>
              {t('hero.intro')}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3" data-intro style={{ '--reveal-delay': 750 } as React.CSSProperties}>
              <Link href="/cooperation" data-magnetic className={buttonClasses('gold', 'xl')}>
                {t('hero.ctaPrimary')}
                <ForwardArrow className="size-5" />
              </Link>
              <Link href="/about" data-magnetic className={buttonClasses('outline-light', 'xl')}>
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Globe + floating glass chips */}
          <div className="relative mx-auto w-full max-w-[min(84vw,520px)] lg:max-w-none" data-intro style={{ '--reveal-delay': 300 } as React.CSSProperties}>
            <Orbits className="absolute inset-[-8%] -z-10 opacity-50" />
            <Globe className="w-full" />
            <div className="glass animate-float absolute start-[-2%] top-[12%] hidden rounded-2xl px-5 py-4 sm:block">
              <p className="text-xs font-semibold text-fg-subtle">{tf('horizon.label')}</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="text-gold text-3xl font-black" data-count>
                  {t('about.horizonValue')}
                </span>
                <span className="text-xs font-bold text-fg/80">{t('about.horizonUnit')}</span>
              </p>
            </div>
            <div className="glass animate-float-slow absolute bottom-[14%] end-[-2%] hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex [animation-delay:-3s]">
              <span className="relative grid size-9 place-items-center rounded-full bg-accent-soft text-accent">
                <span className="animate-pulse-ring absolute size-full rounded-full bg-accent-soft" />
                <AnimatedIcon icon={SparkleIcon} anim="twinkle" weight="fill" className="relative" iconClassName="size-4.5" />
              </span>
              <span>
                <span className="block text-xs text-fg-subtle">{tf('focus.label')}</span>
                <span className="block text-sm font-bold">{tf('focus.value')}</span>
              </span>
            </div>
            <div className="glass animate-float absolute bottom-[2%] start-[14%] hidden rounded-full px-4 py-2 text-xs font-bold text-fg/85 md:block [animation-delay:-5s]">
              <span className="me-2 inline-block size-2 rounded-full bg-gold-400 shadow-[0_0_10px_2px_rgb(234_181_67/0.7)]" />
              {tf('location.value')}
            </div>
          </div>
        </div>

        {/* Pillars strip */}
        <div className={cn(containerClasses, 'relative z-[2] pb-8')}>
          <ul className="glass grid grid-cols-2 divide-edge overflow-hidden rounded-[1.75rem] xl:grid-cols-4 xl:divide-x rtl:xl:divide-x-reverse">
            {pillars.map((p, i) => {
              const Icon = pillarIcons[i]!;
              return (
                <li key={p.title} className="spotlight flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:gap-4 sm:p-6" data-intro style={{ '--reveal-delay': 900 + i * 90 } as React.CSSProperties}>
                  <IconTile icon={Icon} anim={pillarAnims[i]} trigger="always" shape="circle" size="sm" className="sm:size-12 sm:[&_svg]:size-6" />
                  <span className="relative z-[1] min-w-0">
                    <span className="block text-[0.92rem] font-bold leading-6 sm:text-base">{p.title}</span>
                    <span className="mt-0.5 block text-[0.78rem] leading-6 text-fg-subtle">{p.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Keyword marquee */}
        <div className="relative z-[2] border-t border-edge py-5">
          <Marquee speed={60} reverse={rtl}>
            {keywords.map((k) => (
              <span key={k} className="flex items-center gap-8 px-4 text-lg font-bold text-fg-subtle sm:text-xl" dir={rtl ? 'rtl' : 'ltr'}>
                {k}
                <SparkleIcon weight="fill" className="size-4 text-gold-400" aria-hidden />
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ============================================================ MANIFESTO */}
      <section className="grain relative isolate overflow-hidden bg-hero py-24 text-fg sm:py-32" aria-labelledby="manifesto-title">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(0_170_169/0.12),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-dots mask-radial opacity-70" />
        <div className={cn(containerClasses, 'grid items-center gap-14 lg:grid-cols-[1.08fr_1fr] lg:gap-20')}>
          <div>
            <div data-reveal>
              <Kicker index={num(1, locale)} icon={CompassIcon} anim="spin">
                {t('about.kicker')}
              </Kicker>
            </div>
            <h2 id="manifesto-title" className="mt-6 text-[clamp(2rem,1.2rem+2.9vw,3.6rem)] font-black leading-[1.22] text-fg">
              <Words text={t('about.title')} wordClassName={(_, i, n) => (i >= n - 2 ? 'text-gold' : undefined)} />
            </h2>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-9 text-fg-muted sm:text-[1.1rem]" data-reveal style={{ '--reveal-delay': 120 } as React.CSSProperties}>
              {t('about.text')}
            </p>
            <div className="mt-10" data-reveal style={{ '--reveal-delay': 220 } as React.CSSProperties}>
              <Link href="/about" data-magnetic className={buttonClasses('primary', 'lg')}>
                {t('about.cta')}
                <ForwardArrow />
              </Link>
            </div>
          </div>

          <ul className="relative grid gap-4 sm:gap-5">
            {/* Rail threading the three icons */}
            <span aria-hidden className="absolute inset-y-14 start-[3rem] w-px bg-gradient-to-b from-transparent via-accent/45 to-transparent sm:start-[3.25rem]" />
            {values.map((v, i) => (
              <li key={v.title} className="relative" data-reveal style={{ '--reveal-delay': 150 + i * 120 } as React.CSSProperties}>
                <div className="group spotlight relative flex items-center gap-5 overflow-hidden rounded-[1.75rem] border border-edge bg-card p-5 shadow-card transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-lift sm:p-6">
                  <IconTile icon={valueIcons[i]} anim={valueAnims[i]} trigger="always" shape={(['blob', 'hex', 'circle'] as const)[i]} />
                  <div className="relative z-[1] min-w-0">
                    <h3 className="text-[1.08rem] font-black text-fg">{v.title}</h3>
                    <p className="mt-1 text-[0.92rem] leading-7 text-fg-muted">{v.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================ SERVICES BENTO */}
      <Section tone="dark" labelledBy="services-title" aurora={false} className="pt-8 sm:pt-10 lg:pt-12">
        <SectionHeader
          id="services-title"
          kicker={t('services.kicker')}
          index={num(2, locale)}
          icon={HandCoinsIcon}
          anim="float"
          title={t('services.title')}
          text={t('services.text')}
          tone="light"
          highlight={2}
          action={
            <Link href="/services" data-magnetic className={buttonClasses('outline-light', 'md')}>
              {t('services.cta')}
              <ForwardArrow />
            </Link>
          }
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {serviceSlugs.map((slug, i) => {
            const Icon = serviceIcons[slug];
            const big = i === 0;
            return (
              <li key={slug} className={cn(big ? 'md:col-span-2 lg:col-span-4 lg:row-span-2' : i === 1 ? 'lg:col-span-2 lg:row-span-2' : 'lg:col-span-2')} data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
                <Link
                  href={`/services/${slug}`}
                  className={cn(
                    'group spotlight border-gradient relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-card p-6 transition-colors duration-500 hover:bg-card-hover sm:p-8',
                    big && 'min-h-[22rem] justify-between lg:p-11',
                  )}
                >
                  <span aria-hidden className={cn('pointer-events-none absolute font-black text-fg/[0.04] transition-colors duration-700 group-hover:text-accent/[0.08]', big ? '-bottom-10 end-6 text-[12rem]' : '-bottom-6 end-4 text-[6rem]')}>
                    {num(i + 1, locale)}
                  </span>
                  {big && <Orbits className="pointer-events-none absolute -end-24 -top-24 w-[26rem] opacity-40 transition-opacity duration-700 group-hover:opacity-70" />}
                  <div className="relative z-[1]">
                    <IconTile icon={Icon} anim={serviceAnims[slug]} size={big ? 'xl' : 'md'} shape={big ? 'blob' : 'squircle'} trigger={big ? 'always' : 'hover'} />
                    <h3 className={cn('mt-6 font-black text-fg', big ? 'text-[clamp(1.6rem,1.2rem+1.2vw,2.3rem)]' : 'text-xl')}>{ts(`items.${slug}.title`)}</h3>
                    <p className={cn('mt-3 leading-8 text-fg-muted', big ? 'max-w-md text-[1.05rem]' : 'text-[0.95rem]')}>{ts(`items.${slug}.short`)}</p>
                    {i < 2 && (
                      <ul className={cn('grid max-w-md gap-3', big ? 'mt-7' : 'mt-6 border-t border-edge pt-6')}>
                        {(ts.raw(`items.${slug}.benefits`) as string[]).slice(0, big ? 3 : 2).map((b) => (
                          <li key={b} className="flex items-center gap-3 text-[0.92rem] font-semibold text-fg/85">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-accent ring-1 ring-accent/20">
                              <CheckIcon weight="bold" className="size-3.5" aria-hidden />
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className="relative z-[1] mt-7 inline-flex items-center gap-2 text-sm font-bold text-accent">
                    {tc('learnMore')}
                    <span className="grid size-8 place-items-center rounded-full border border-edge transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-midnight">
                      <ForwardArrow className="size-3.5" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="md:col-span-2 lg:col-span-6" data-reveal>
            <Link
              href="/cooperation"
              className="group border-glow relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[2rem] bg-[radial-gradient(80%_120%_at_0%_50%,rgb(234_181_67/0.22),transparent_60%),radial-gradient(70%_120%_at_100%_50%,rgb(0_170_169/0.25),transparent_60%),rgb(255_255_255/0.03)] p-8 sm:flex-row sm:items-center sm:p-10"
            >
              <span className="relative z-[1]">
                <span className="block text-2xl font-black text-fg sm:text-3xl">{t('services.cooperationTitle')}</span>
                <span className="mt-2 block text-fg-muted">{t('services.cooperationText')}</span>
              </span>
              <span className={buttonClasses('gold', 'lg', 'relative z-[1] shrink-0')}>
                {tc('submitProposal')}
                <ForwardArrow />
              </span>
            </Link>
          </li>
        </ul>
      </Section>

      {/* ============================================================ INVESTMENT ACCORDION */}
      <section className="grain relative isolate overflow-hidden bg-canvas-alt py-28 text-fg sm:py-36" aria-labelledby="investment-title">
        <Aurora intensity={0.7} variant="gold" />
        <div className={containerClasses}>
          <SectionHeader
            id="investment-title"
            kicker={t('investment.kicker')}
            index={num(3, locale)}
            icon={RocketLaunchIcon}
            anim="rise"
            title={t('investment.title')}
            text={t('investment.text')}
            tone="light"
            highlight={2}
            action={
              <Link href="/investment" data-magnetic className={buttonClasses('outline-light', 'md')}>
                {t('investment.cta')}
                <ForwardArrow />
              </Link>
            }
          />
          <ul className="acc mt-14 grid gap-3 md:grid-cols-2 xl:flex xl:h-[34rem] xl:flex-row" data-reveal>
            {areaKeys.map((key, i) => {
              const Icon = areaIcons[key];
              const examples = ti.raw(`areas.${key}.examples`) as string[];
              return (
                <li key={key} className="group group/acc scheme-dark relative overflow-hidden rounded-[2rem] ring-1 ring-edge xl:min-h-0">
                  {/* Below xl the card grows with its content; on wide screens it fills the accordion slot */}
                  <Link href={`/investment#${key}`} className="relative flex h-full min-h-[22rem] flex-col justify-end p-6 pt-24 sm:p-8 sm:pt-28 xl:absolute xl:inset-0 xl:min-h-0">
                    <Image src={areaImages[key]} alt="" fill sizes="(min-width: 1280px) 60vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover/acc:scale-110" />
                    <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,#020a18_8%,rgb(2_10_24/0.65)_45%,rgb(2_10_24/0.15))]" />
                    <span aria-hidden className="absolute start-7 top-7 font-black text-fg/25 sm:start-8 sm:top-8">{num(i + 1, locale)}</span>
                    <span className="relative">
                      <span className="glass mb-5 grid size-13 place-items-center rounded-full text-accent">
                        <AnimatedIcon icon={Icon} anim={areaAnims[key]} trigger="hover" iconClassName="size-6" />
                      </span>
                      <span className="acc-title block text-xl font-black leading-8 sm:text-2xl">{ti(`areas.${key}.title`)}</span>
                      <span className="acc-more mt-3 block max-w-md text-[0.95rem] leading-7 text-fg-muted">
                        {ti(`areas.${key}.text`)}
                      </span>
                      <span className="acc-more mt-4 flex flex-wrap gap-2">
                        {examples.map((e) => (
                          <span key={e} className="rounded-full border border-edge bg-card-hover px-3 py-1 text-xs font-semibold text-fg/85 backdrop-blur">
                            {e}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="absolute end-7 top-7 grid size-11 place-items-center rounded-full bg-tint backdrop-blur transition-all duration-500 group-hover/acc:bg-gold-400 group-hover/acc:text-midnight sm:end-8 sm:top-8">
                      <ArrowUpRightIcon weight="bold" className="size-5 rtl:-scale-x-100" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ============================================================ HORIZON (light) */}
      <Section labelledBy="horizon-title" className="overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial opacity-60" />
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div data-reveal>
              <Kicker index={num(4, locale)} icon={FlagBannerIcon} anim="wave">
                {ta('horizon.title')}
              </Kicker>
            </div>
            <h2 id="horizon-title" className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2" data-reveal>
              <span className="text-brand tabular text-[clamp(5rem,3rem+9vw,11rem)] font-black leading-none" data-count>
                {ta('horizon.value')}
              </span>
              <span className="text-[clamp(1.4rem,1rem+1.5vw,2.4rem)] font-black text-fg">{ta('horizon.unit')}</span>
            </h2>
            <p className="mt-4 text-lg font-bold text-accent" data-reveal>
              {ta('horizon.label')}
            </p>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-9 text-fg-muted" data-reveal>
              {ta('horizon.text')}
            </p>
          </div>
          <div className="relative" data-reveal="scale">
            <Orb tone="aqua" size={110} className="-start-6 -top-8 z-10 animate-float" />
            <Orb tone="gold" size={70} className="-bottom-6 end-10 z-10 animate-float-slow" />
            <div data-tilt className="scheme-dark relative overflow-hidden rounded-[2.25rem] shadow-lift">
              <div className="relative aspect-[5/4]">
                <Image src="/images/about/office.jpg" alt={rtl ? 'ساختمان اداری در تهران با نمای برج میلاد' : 'Office building in Tehran with Milad Tower in view'} fill sizes="(min-width: 1024px) 620px, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/10 to-transparent" />
              </div>
              <div className="glass absolute inset-x-5 bottom-5 rounded-2xl p-5 text-fg">
                <p className="text-sm font-bold">{tf('shareholder.label')}</p>
                <p className="mt-1 text-xl font-black">{tf('shareholder.value')}</p>
              </div>
            </div>
          </div>
        </div>
        {stats.length > 0 && (
          <dl className="mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-[1.75rem] border border-edge bg-card p-7 text-center shadow-card" data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
                <dt className="text-sm text-fg-muted">{s.label[locale] ?? s.label.en}</dt>
                <dd className="text-brand order-first text-5xl font-black" data-count>
                  {localizeDigits(s.value, locale)}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <FactsGrid locale={locale} className="mt-20" />
      </Section>

      {/* ============================================================ PROCESS (sticky storytelling) */}
      <Section tone="surface" labelledBy="process-title">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeader id="process-title" kicker={t('process.kicker')} index={num(5, locale)} icon={SignpostIcon} anim="swing" title={t('process.title')} text={t('process.text')} highlight={2} />
            <Link href="/process" data-magnetic className={buttonClasses('primary', 'lg', 'mt-10')} data-reveal>
              {t('process.cta')}
              <ForwardArrow />
            </Link>
          </div>
          <StepsTimeline locale={locale} steps={steps} orientation="vertical" icons={processStepIcons} />
        </div>
      </Section>

      {/* ============================================================ PORTFOLIO (only with data) */}
      {companies.length > 0 && (
        <Section labelledBy="portfolio-title">
          <SectionHeader
            id="portfolio-title"
            kicker={t('portfolio.kicker')}
            icon={BriefcaseIcon}
            anim="drop"
            title={t('portfolio.title')}
            action={
              <Link href="/portfolio" className={buttonClasses('outline', 'md')}>
                {t('portfolio.cta')}
                <ForwardArrow />
              </Link>
            }
          />
          <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {companies.map((c) => (
              <li key={c.id}>
                <Link href={`/portfolio/${c.slug}`} className="spotlight flex h-full flex-col items-center gap-3 overflow-hidden rounded-[1.75rem] border border-edge bg-card p-7 text-center shadow-card transition-transform hover:-translate-y-1">
                  {c.logo && <Image src={c.logo} alt="" width={120} height={64} className="relative z-[1] h-16 w-auto object-contain" />}
                  <span className="relative z-[1] text-sm font-bold text-fg">{c.name}</span>
                  <span className="relative z-[1] text-xs text-fg-muted">{tsec(c.sector)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ============================================================ NEWS */}
      {posts.length > 0 && (
        <Section labelledBy="news-title">
          <SectionHeader
            id="news-title"
            kicker={t('news.kicker')}
            index={num(6, locale)}
            icon={NewspaperIcon}
            anim="tilt"
            title={t('news.title')}
            action={
              <Link href="/news" data-magnetic className={buttonClasses('outline', 'md')}>
                {t('news.cta')}
                <ForwardArrow />
              </Link>
            }
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <PostCard post={posts[0]!} locale={locale} featured="tall" categoryLabel={tn(`categories.${posts[0]!.category}`)} minutesLabel={tc.raw('minutesRead') as string} />
            <div className="grid gap-6">
              {posts.slice(1).map((p) => (
                <PostCard key={p.id} post={p} locale={locale} featured="row" categoryLabel={tn(`categories.${p.category}`)} minutesLabel={tc.raw('minutesRead') as string} />
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ============================================================ FAQ */}
      {faqs.length > 0 && (
        <Section tone="surface" labelledBy="faq-title">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeader id="faq-title" kicker={t('faq.kicker')} index={num(7, locale)} icon={ChatCenteredDotsIcon} anim="pop" title={t('faq.title')} />
              <Link href="/faq" data-magnetic className={buttonClasses('primary', 'lg', 'mt-10')} data-reveal>
                {t('faq.cta')}
                <ForwardArrow />
              </Link>
            </div>
            <div data-reveal>
              <FaqAccordion items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
            </div>
          </div>
        </Section>
      )}

      {/* ============================================================ RELATED INSTITUTIONS */}
      {partners.length > 0 && (
        <section className="relative bg-canvas py-20 sm:py-24" aria-labelledby="related-title">
          <div className={cn(containerClasses, 'text-center')}>
            <div data-reveal className="flex justify-center">
              <Kicker icon={HandshakeIcon} anim="nod">
                {t('related.kicker')}
              </Kicker>
            </div>
            <h2 id="related-title" className="mt-5 text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] font-black text-fg" data-reveal>
              {t('related.title')}
            </h2>
          </div>
          <PartnersMarquee partners={partners} newTab={tc('newTab')} className="mt-12" />
        </section>
      )}

      <CtaBand icon={LightbulbIcon} anim="swing" title={t('cta.title')} text={t('cta.text')} primary={{ href: '/cooperation', label: t('cta.primary') }} secondary={{ href: '/contact', label: t('cta.secondary') }} />
    </>
  );
}
