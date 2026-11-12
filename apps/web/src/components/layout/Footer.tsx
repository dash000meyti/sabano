import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { locales, localeMeta, localizedPath, type Locale } from '@sabano/i18n';
import { Link } from '@/i18n/navigation';
import { getCompanyCount, getContact, getSocial } from '@/lib/data';
import { formatPhone, localizeDigits, phoneHref } from '@/lib/format';
import { serviceSlugs } from '@/lib/site';
import { Logo } from '../brand/Logo';
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
    <footer className="relative overflow-hidden bg-navy-mesh text-white" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        {tc('orgName')}
      </h2>
      <div className="pointer-events-none absolute inset-0 bg-line-grid opacity-60 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000)]" />
      <div className="hairline-gold absolute inset-x-0 top-0" />
      <div className="relative mx-auto max-w-[1240px] px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2.7fr]">
          <div>
            <Link href="/" className="inline-block rounded-2xl" aria-label={tc('home')}>
              <Logo name={tc('siteName')} sub={tc('brandSub')} tone="light" />
            </Link>
            <p className="mt-5 max-w-sm text-[0.92rem] leading-8 text-white/70">{t('about')}</p>
            {socials.length > 0 && (
              <div className="mt-6">
                <p className="sr-only">{t('social')}</p>
                <ul className="flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label} ${tc('newTab')}`}
                        className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-all hover:-translate-y-0.5 hover:border-gold-400/60 hover:text-gold-300"
                      >
                        {s.icon}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1.25fr_1fr_1.45fr]">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-sm font-bold text-gold-300">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[0.9rem] text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <h3 className="text-sm font-bold text-gold-300">{t('contactTitle')}</h3>
              <address className="mt-4 space-y-3 text-[0.9rem] not-italic text-white/75">
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-white">
                  <EnvelopeSimpleIcon weight="duotone" className="size-4 shrink-0 text-teal-300" aria-hidden />
                  <span dir="ltr">{contact.email}</span>
                </a>
                <span className="flex items-start gap-2">
                  <PhoneIcon weight="duotone" className="mt-1 size-4 shrink-0 text-teal-300" aria-hidden />
                  <span className="sr-only">{tct('phone')}</span>
                  <span className="flex flex-col gap-1">
                    {contact.phones.map((p) => (
                      <a key={p} href={phoneHref(p)} dir="ltr" className="text-start hover:text-white">
                        {formatPhone(p, locale)}
                      </a>
                    ))}
                  </span>
                </span>
                <span className="flex items-start gap-2">
                  <MapPinIcon weight="duotone" className="mt-1 size-4 shrink-0 text-teal-300" aria-hidden />
                  <span className="leading-7">{contact.address[locale] ?? contact.address.en}</span>
                </span>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-6 text-[0.8rem] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>{t('rights', { year })}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <nav aria-label={tc('language')} className="flex flex-wrap gap-x-3 gap-y-1">
              {locales.map((l) => (
                <a
                  key={l}
                  href={localizedPath(l, '/')}
                  lang={localeMeta[l].hreflang}
                  hrefLang={localeMeta[l].hreflang}
                  className={l === locale ? 'font-bold text-white' : 'hover:text-white'}
                >
                  {localeMeta[l].name}
                </a>
              ))}
            </nav>
            <a href={localizedPath(locale, '/news/rss.xml')} className="inline-flex items-center gap-1.5 hover:text-white">
              <RssIcon weight="bold" className="size-3.5" aria-hidden />
              {t('rss')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
