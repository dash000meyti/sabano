import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses, cn, containerClasses } from '@sabano/ui';
import { DataLines, SignalRows } from '@/components/decor/DataLines';
import { CheckCircleIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { FactsGrid } from '@/components/sections/FactsGrid';
import { FaqAccordion } from '@/components/sections/FaqAccordion';
import { PartnersGrid } from '@/components/sections/PartnersGrid';
import { PostCard } from '@/components/sections/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Kicker, Section, SectionHeader } from '@/components/ui/Section';
import { areaIcons, pillarIcons, serviceIcons } from '@/components/visual-maps';
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
  return buildMetadata({
    locale,
    path: '/',
    title: t('title'),
    description: t('description'),
    image: ogImageFor(locale, 'home'),
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const ts = await getTranslations({ locale, namespace: 'services' });
  const ti = await getTranslations({ locale, namespace: 'investment' });
  const tp = await getTranslations({ locale, namespace: 'process' });
  const tn = await getTranslations({ locale, namespace: 'news' });
  const tsec = await getTranslations({ locale, namespace: 'sectors' });

  const pillars = t.raw('pillars') as { title: string; text: string }[];
  const values = t.raw('about.values') as string[];
  const steps = tp.raw('steps') as { title: string; text: string }[];
  const posts = getPosts(locale, undefined, 3).items;
  const faqs = getFaqs(locale).slice(0, 4);
  const partners = getPartners(locale);
  const companies = getCompanies(locale).slice(0, 8);
  const stats = getStats().filter((s) => s.label[locale] || s.label.en);

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
      <JsonLd
        data={[
          orgLd,
          websiteLd(locale, tc('siteName'), t('meta.description')),
          webPageLd({ locale, path: '/', name: t('meta.title'), description: t('meta.description') }),
        ]}
      />

      {/* ---------------------------------------------------------- Hero */}
      <section className="relative isolate flex min-h-[min(100svh,960px)] flex-col overflow-hidden bg-navy-950 text-white" aria-labelledby="hero-title">
        <Image
          src="/images/hero/tehran.jpg"
          alt={locale === 'fa' ? 'نمای شبانهٔ تهران با برج میلاد و خطوط داده' : 'Tehran skyline at dusk with Milad Tower and data lines'}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="-z-20 object-cover object-[30%_50%] sm:object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/20 rtl:bg-gradient-to-l" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/10 to-navy-950/40" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-line-grid opacity-40 [mask-image:radial-gradient(80%_70%_at_50%_40%,#000,transparent)]" />
        <DataLines className="absolute bottom-[18%] end-[2%] -z-10 hidden w-[44%] max-w-[700px] opacity-80 lg:block rtl:-scale-x-100" />
        <SignalRows className="absolute start-0 top-[30%] -z-10 hidden w-44 opacity-25 2xl:block rtl:-scale-x-100" />

        <div className={cn(containerClasses, 'flex flex-1 flex-col justify-center pb-10 pt-36 sm:pt-40')}>
          <div className="max-w-3xl">
            <p className="glass-card inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[0.8rem] font-semibold text-white/90">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-teal-400" />
              </span>
              {t('hero.eyebrow')}
            </p>
            <h1 id="hero-title" className="mt-7 text-[clamp(2.4rem,1.4rem+4.4vw,4.75rem)] font-black leading-[1.15]">
              <span className="block">{t('hero.title1')}</span>
              <span className="text-gradient-gold block pb-2">{t('hero.title2')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[1.06rem] leading-8 text-white/80 sm:text-lg sm:leading-9">{t('hero.intro')}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/cooperation" className={buttonClasses('gold', 'lg')}>
                {t('hero.ctaPrimary')}
                <ForwardArrow />
              </Link>
              <Link href="/about" className={buttonClasses('glass', 'lg')}>
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className={cn(containerClasses, 'relative pb-10')}>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {pillars.map((p, i) => {
              const Icon = pillarIcons[i]!;
              return (
                <li
                  key={p.title}
                  className="glass-card group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-white/10 sm:p-5"
                  data-reveal
                  style={{ '--reveal-delay': 200 + i * 90 } as React.CSSProperties}
                >
                  <IconTile tone="dark" size="sm" className="sm:size-12 sm:[&>svg]:size-6">
                    <Icon weight="duotone" aria-hidden />
                  </IconTile>
                  <span className="min-w-0">
                    <span className="block text-[0.92rem] font-bold leading-6 sm:text-base">{p.title}</span>
                    <span className="mt-0.5 block text-[0.78rem] leading-6 text-white/60">{p.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- About */}
      <Section labelledBy="about-title">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div data-reveal>
            <Kicker>{t('about.kicker')}</Kicker>
            <h2 id="about-title" className="mt-3 text-[clamp(1.7rem,1.2rem+1.8vw,2.6rem)] font-extrabold text-navy-900">
              {t('about.title')}
            </h2>
            <p className="mt-5 text-[1.03rem] leading-9 text-muted">{t('about.text')}</p>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {values.map((v) => (
                <li key={v} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-navy-900">
                  <CheckCircleIcon weight="fill" className="size-4.5 text-teal-500" aria-hidden />
                  {v}
                </li>
              ))}
            </ul>
            <Link href="/about" className={buttonClasses('primary', 'md', 'mt-9')}>
              {t('about.cta')}
              <ForwardArrow />
            </Link>
          </div>
          <div className="relative" data-reveal style={{ '--reveal-delay': 120 } as React.CSSProperties}>
            <div className="absolute -inset-4 -z-10 rounded-[2.25rem] bg-gradient-to-br from-teal-100 via-transparent to-gold-100 opacity-70" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-lift">
              <Image
                src="/images/about/office.jpg"
                alt={locale === 'fa' ? 'ساختمان اداری در تهران با نمای برج میلاد' : 'Office building in Tehran with Milad Tower in view'}
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
            </div>
            <div className="glass-card absolute -bottom-8 start-6 max-w-[17rem] rounded-2xl bg-navy-950/70 p-5 text-white shadow-lift sm:start-10">
              <p className="flex items-baseline gap-2">
                <span className="text-gradient-gold text-4xl font-black">{t('about.horizonValue')}</span>
                <span className="text-sm font-bold text-white/85">{t('about.horizonUnit')}</span>
              </p>
              <p className="mt-1 text-[0.8rem] leading-6 text-white/65">{t('about.horizonLabel')}</p>
            </div>
          </div>
        </div>
        {stats.length > 0 && (
          <dl className="mt-24 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-6 text-center" data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
                <dt className="text-sm text-muted">{s.label[locale] ?? s.label.en}</dt>
                <dd className="text-gradient-teal order-first text-4xl font-black">{localizeDigits(s.value, locale)}</dd>
              </div>
            ))}
          </dl>
        )}
        <FactsGrid locale={locale} className={stats.length > 0 ? 'mt-6' : 'mt-24'} />
      </Section>

      {/* ---------------------------------------------------------- Services */}
      <Section tone="surface" labelledBy="services-title" className="overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid-dark [mask-image:linear-gradient(to_bottom,#000,transparent_60%)]" />
        <SectionHeader
          id="services-title"
          kicker={t('services.kicker')}
          title={t('services.title')}
          text={t('services.text')}
          action={
            <Link href="/services" className={buttonClasses('outline', 'md')}>
              {t('services.cta')}
              <ForwardArrow />
            </Link>
          }
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSlugs.map((slug, i) => {
            const Icon = serviceIcons[slug];
            return (
              <li key={slug} data-reveal style={{ '--reveal-delay': i * 70 } as React.CSSProperties}>
                <Link
                  href={`/services/${slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lift"
                >
                  <span className="pointer-events-none absolute -end-16 -top-16 size-40 rounded-full bg-gradient-to-br from-teal-100 to-gold-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  <IconTile>
                    <Icon weight="duotone" aria-hidden />
                  </IconTile>
                  <h3 className="relative mt-6 text-lg font-extrabold text-navy-900">{ts(`items.${slug}.title`)}</h3>
                  <p className="relative mt-2.5 flex-1 text-[0.93rem] leading-7 text-muted">{ts(`items.${slug}.short`)}</p>
                  <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700">
                    {tc('learnMore')}
                    <ForwardArrow className="transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            );
          })}
          <li data-reveal style={{ '--reveal-delay': 350 } as React.CSSProperties}>
            <Link
              href="/cooperation"
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-navy-mesh p-7 text-white shadow-lift transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
              <SignalRows className="absolute -bottom-2 end-2 w-32 opacity-30" rows={6} />
              <IconTile tone="gold">
                <ForwardArrow className="size-6" />
              </IconTile>
              <h3 className="relative mt-6 text-lg font-extrabold">{t('services.cooperationTitle')}</h3>
              <p className="relative mt-2.5 flex-1 text-[0.93rem] leading-7 text-white/70">{t('services.cooperationText')}</p>
              <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold-300">
                {tc('submitProposal')}
                <ForwardArrow className="transition-transform group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        </ul>
      </Section>

      {/* ---------------------------------------------------------- Investment focus */}
      <Section tone="navy" labelledBy="investment-title">
        <div className="pointer-events-none absolute -start-40 top-1/3 size-[32rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:items-center">
          <div data-reveal>
            <Kicker tone="light">{t('investment.kicker')}</Kicker>
            <h2 id="investment-title" className="mt-3 text-[clamp(1.7rem,1.2rem+1.8vw,2.6rem)] font-extrabold">
              {t('investment.title')}
            </h2>
            <p className="mt-5 text-[1.02rem] leading-8 text-white/70">{t('investment.text')}</p>
            <Link href="/investment" className={buttonClasses('outline-light', 'md', 'mt-8')}>
              {t('investment.cta')}
              <ForwardArrow />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {areaKeys.map((key, i) => {
              const Icon = areaIcons[key];
              return (
                <li key={key} data-reveal style={{ '--reveal-delay': i * 90 } as React.CSSProperties}>
                  <Link
                    href={`/investment#${key}`}
                    className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-3xl ring-1 ring-white/10"
                  >
                    <Image
                      src={areaImages[key]}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-110"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />
                    <span className="relative flex items-end justify-between gap-3 p-5">
                      <span>
                        <span className="glass-card mb-3 grid size-10 place-items-center rounded-xl text-teal-300">
                          <Icon weight="duotone" className="size-5" aria-hidden />
                        </span>
                        <span className="block text-base font-extrabold leading-7">{ti(`areas.${key}.title`)}</span>
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors group-hover:bg-gold-400 group-hover:text-navy-950">
                        <ForwardArrow />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Process */}
      <Section labelledBy="process-title">
        <SectionHeader
          id="process-title"
          kicker={t('process.kicker')}
          title={t('process.title')}
          text={t('process.text')}
          action={
            <Link href="/process" className={buttonClasses('outline', 'md')}>
              {t('process.cta')}
              <ForwardArrow />
            </Link>
          }
        />
        <ol className="relative mt-14 grid gap-6 md:grid-cols-5">
          <span aria-hidden className="absolute inset-x-[10%] top-7 hidden h-px bg-gradient-to-r from-teal-200 via-gold-300 to-teal-200 md:block" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative" data-reveal style={{ '--reveal-delay': i * 90 } as React.CSSProperties}>
              <span className="relative z-10 mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-white text-lg font-black text-navy-900 shadow-card md:mx-0">
                <span className="text-gradient-teal">{localizeDigits(i + 1, locale)}</span>
              </span>
              <h3 className="mt-5 text-center text-base font-extrabold text-navy-900 md:text-start">{s.title}</h3>
              <p className="mt-2 text-center text-[0.88rem] leading-7 text-muted md:text-start">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------------------------------------------------------- Portfolio (only when there is data) */}
      {companies.length > 0 && (
        <Section tone="surface" labelledBy="portfolio-title">
          <SectionHeader
            id="portfolio-title"
            kicker={t('portfolio.kicker')}
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
                <Link href={`/portfolio/${c.slug}`} className="flex h-full flex-col items-center gap-3 rounded-3xl border border-line bg-white p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lift">
                  {c.logo && <Image src={c.logo} alt="" width={120} height={64} className="h-16 w-auto object-contain" />}
                  <span className="text-sm font-bold text-navy-900">{c.name}</span>
                  <span className="text-xs text-muted">{tsec(c.sector)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---------------------------------------------------------- News */}
      {posts.length > 0 && (
        <Section tone={companies.length > 0 ? 'light' : 'surface'} labelledBy="news-title">
          <SectionHeader
            id="news-title"
            kicker={t('news.kicker')}
            title={t('news.title')}
            action={
              <Link href="/news" className={buttonClasses('outline', 'md')}>
                {t('news.cta')}
                <ForwardArrow />
              </Link>
            }
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} locale={locale} categoryLabel={tn(`categories.${p.category}`)} minutesLabel={tc.raw('minutesRead') as string} />
            ))}
          </div>
        </Section>
      )}

      {/* ---------------------------------------------------------- FAQ */}
      {faqs.length > 0 && (
        <Section labelledBy="faq-title">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div data-reveal>
              <Kicker>{t('faq.kicker')}</Kicker>
              <h2 id="faq-title" className="mt-3 text-[clamp(1.7rem,1.2rem+1.8vw,2.6rem)] font-extrabold text-navy-900">
                {t('faq.title')}
              </h2>
              <Link href="/faq" className={buttonClasses('primary', 'md', 'mt-8')}>
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

      {/* ---------------------------------------------------------- Related institutions */}
      {partners.length > 0 && (
        <Section tone="surface" labelledBy="related-title" className="py-16 sm:py-20 lg:py-24">
          <SectionHeader id="related-title" kicker={t('related.kicker')} title={t('related.title')} align="center" />
          <div className="mt-12">
            <PartnersGrid partners={partners} newTab={tc('newTab')} />
          </div>
        </Section>
      )}

      <CtaBand
        title={t('cta.title')}
        text={t('cta.text')}
        primary={{ href: '/cooperation', label: t('cta.primary') }}
        secondary={{ href: '/contact', label: t('cta.secondary') }}
      />
    </>
  );
}
