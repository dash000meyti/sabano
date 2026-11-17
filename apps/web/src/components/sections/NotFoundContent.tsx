'use client';

import { useTranslations } from 'next-intl';
import { buttonClasses } from '@sabano/ui';
import { Link } from '@/i18n/navigation';

/**
 * Text of the 404 page. It is a client component so the locale comes from the
 * layout's provider: reading it on the server would need request headers, which
 * breaks cached (ISR) routes that call notFound().
 */
export function NotFoundContent() {
  const t = useTranslations('notFound');
  const tn = useTranslations('nav');
  const tc = useTranslations('common');
  const links = [
    { href: '/services', label: tn('services') },
    { href: '/investment', label: tn('investmentAreas') },
    { href: '/cooperation', label: tn('cooperation') },
    { href: '/faq', label: tn('faq') },
    { href: '/contact', label: tn('contact') },
  ];
  return (
    <>
      <title>{`${t('title')} | ${tc('siteName')}`}</title>
      <p className="text-gold tabular text-[clamp(7rem,4rem+14vw,15rem)] font-black leading-none" aria-hidden>
        404
      </p>
      <h1 className="mt-4 text-3xl font-black sm:text-5xl">{t('title')}</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-fg-muted">{t('text')}</p>
      <Link href="/" data-magnetic className={buttonClasses('gold', 'xl', 'mt-10')}>
        {t('home')}
      </Link>
      <p className="mt-14 text-sm font-bold text-fg-subtle">{t('suggestions')}</p>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={buttonClasses('outline-light', 'sm')}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
