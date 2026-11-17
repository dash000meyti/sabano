import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { locales, localeMeta, localizedPath, type Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { Link } from '@/i18n/navigation';
import { getCompanyCount, getContact, getSocial } from '@/lib/data';
import { formatPhone, localizeDigits, phoneHref } from '@/lib/format';
import { serviceSlugs } from '@/lib/site';
import { Logo } from '../brand/Logo';
import { Aurora } from '../decor/Aurora';
import {
  EnvelopeSimpleIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  MapPinIcon,
  PhoneIcon,
  RssIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
  XLogoIcon,
} from '../icons';

function AparatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="3.5" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const ts = await getTranslations({ locale, namespace: 'services' });
  const tct = await getTranslations({ locale, namespace: 'contact' });
  const contact = getContact();
  const social = getSocial();
  const hasPortfolio = getCompanyCount() > 0;
  const year = localizeDigits(
    new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian-nu-latn' : 'en', { year: 'numeric', timeZone: 'Asia/Tehran' }).format(new Date()).replace(/\D/g, ''),
    locale,
  );

  const socials = [
    { key: 'linkedin', href: social.linkedin, label: 'LinkedIn', icon: <LinkedinLogoIcon weight="fill" className="size-5" aria-hidden /> },
    { key: 'telegram', href: social.telegram, label: 'Telegram', icon: <TelegramLogoIcon weight="fill" className="size-5" aria-hidden /> },
    { key: 'bale', href: social.bale, label: locale === 'fa' ? 'بله' : 'Bale', icon: <Image src="/images/social/bale.png" alt="" width={20} height={20} className="size-5 rounded-full" /> },
    { key: 'aparat', href: social.aparat, label: locale === 'fa' ? 'آپارات' : 'Aparat', icon: <AparatIcon className="size-5" /> },
    { key: 'whatsapp', href: social.whatsapp, label: 'WhatsApp', icon: <WhatsappLogoIcon weight="fill" className="size-5" aria-hidden /> },
    { key: 'instagram', href: social.instagram, label: 'Instagram', icon: <InstagramLogoIcon weight="fill" className="size-5" aria-hidden /> },
    { key: 'x', href: social.x, label: 'X', icon: <XLogoIcon weight="fill" className="size-5" aria-hidden /> },
  ].filter((s) => !!s.href);

  const columns = [
    {
      title: tn('fund'),
      links: [
        { href: '/about', label: tn('about') },
        { href: '/leadership', label: tn('leadership') },
        { href: '/investment', label: tn('investmentAreas') },
        { href: '/process', label: tn('process') },
        ...(hasPortfolio ? [{ href: '/portfolio', label: tn('portfolio') }] : []),
      ],
    },
    {
      title: tn('services'),
      links: serviceSlugs.map((s) => ({ href: `/services/${s}`, label: ts(`items.${s}.title`) })),
    },
    {
      title: tn('resources'),
      links: [
        { href: '/news', label: tn('news') },
        { href: '/faq', label: tn('faq') },
        { href: '/cooperation', label: tn('cooperation') },
        { href: '/contact', label: tn('contact') },
        { href: '/privacy', label: tn('privacy') },
      ],
    },
  ];

  return (
    <footer className="grain relative isolate overflow-hidden bg-hero text-fg" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        {tc('orgName')}
      </h2>
      <Aurora intensity={0.6} variant="cool" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-60" />
      <div className="hairline absolute inset-x-0 top-0" />
      <div className="relative z-[2] mx-auto max-w-[1280px] px-5 pt-20 sm:px-8 lg:px-10">
        <div className="grid gap-14 xl:grid-cols-[1.1fr_2.6fr]">
          <div>
            <Link href="/" className="inline-block rounded-full">
              <Logo name={tc('siteName')} sub={tc('brandSub')} tone="light" />
            </Link>
            <p className="mt-6 max-w-sm text-[0.95rem] leading-8 text-fg-muted">{t('about')}</p>
            {socials.length > 0 && (
              <div className="mt-7">
                <p className="sr-only">{t('social')}</p>
                <ul className="flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label} ${tc('newTab')}`}
                        data-magnetic
                        className="grid size-11 place-items-center rounded-full border border-edge bg-card text-fg/80 transition-colors hover:border-accent/60 hover:text-accent"
                      >
                        {s.icon}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Phones: two short link columns side by side; services and contact get full rows */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1fr_1.25fr_1fr_1.45fr]">
            {columns.map((col, ci) => (
              <nav key={col.title} aria-label={col.title} className={cn(ci === 1 && 'max-sm:order-3 max-sm:col-span-2')}>
                <h3 className="text-[0.75rem] font-bold tracking-wide text-accent/90">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="group/fl inline-flex items-center gap-2 text-[0.92rem] text-fg-muted transition-colors hover:text-fg">
                        <span aria-hidden className="h-px w-0 bg-gold-400 transition-all duration-300 group-hover/fl:w-3" />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div className="max-sm:order-4 max-sm:col-span-2">
              <h3 className="text-[0.75rem] font-bold tracking-wide text-accent/90">{t('contactTitle')}</h3>
              <address className="mt-5 space-y-3.5 text-[0.92rem] not-italic text-fg-muted">
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 hover:text-fg">
                  <EnvelopeSimpleIcon weight="duotone" className="size-4.5 shrink-0 text-gold-ink" aria-hidden />
                  <span dir="ltr">{contact.email}</span>
                </a>
                <span className="flex items-start gap-2.5">
                  <PhoneIcon weight="duotone" className="mt-1 size-4.5 shrink-0 text-gold-ink" aria-hidden />
                  <span className="sr-only">{tct('phone')}</span>
                  <span className="flex flex-col gap-1.5">
                    {contact.phones.map((p) => (
                      <a key={p} href={phoneHref(p)} dir="ltr" className="tabular whitespace-nowrap text-start hover:text-fg">
                        {formatPhone(p, locale)}
                      </a>
                    ))}
                  </span>
                </span>
                <span className="flex items-start gap-2.5">
                  <MapPinIcon weight="duotone" className="mt-1 size-4.5 shrink-0 text-gold-ink" aria-hidden />
                  <span className="leading-7">{contact.address[locale] ?? contact.address.en}</span>
                </span>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-edge pt-7 text-[0.8rem] text-fg-subtle md:flex-row md:items-center md:justify-between">
          <p>{t('rights', { year })}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <nav aria-label={tc('language')} className="flex flex-wrap gap-x-3 gap-y-1">
              {locales.map((l) => (
                <a
                  key={l}
                  href={localizedPath(l, '/')}
                  lang={localeMeta[l].hreflang}
                  hrefLang={localeMeta[l].hreflang}
                  className={cn('inline-block py-1.5', l === locale ? 'font-bold text-fg' : 'hover:text-fg')}
                >
                  {localeMeta[l].name}
                </a>
              ))}
            </nav>
            <a href={localizedPath(locale, '/news/rss.xml')} className="inline-flex items-center gap-1.5 py-1.5 hover:text-fg">
              <RssIcon weight="bold" className="size-3.5" aria-hidden />
              {t('rss')}
            </a>
          </div>
        </div>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden className="pointer-events-none relative z-[1] mt-6 select-none overflow-hidden">
        <p
          className={`text-outline text-center font-black leading-[0.85] tracking-tighter ${locale === 'fa' ? 'text-[26vw]' : 'text-[20vw]'} translate-y-[18%] bg-[linear-gradient(180deg,rgb(255_255_255/0.14),transparent_75%)] bg-clip-text`}
        >
          {locale === 'fa' ? 'صبانو' : 'SABANO'}
        </p>
      </div>
    </footer>
  );
}
