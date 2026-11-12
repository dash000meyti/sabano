import { getLocale, getTranslations } from 'next-intl/server';
import { buttonClasses, containerClasses } from '@sabano/ui';
import { DataLines } from '@/components/decor/DataLines';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@sabano/i18n';

export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale, namespace: 'notFound' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const links = [
    { href: '/services', label: tn('services') },
    { href: '/investment', label: tn('investmentAreas') },
    { href: '/cooperation', label: tn('cooperation') },
    { href: '/faq', label: tn('faq') },
    { href: '/contact', label: tn('contact') },
  ];
  return (
    <section className="relative isolate overflow-hidden bg-navy-mesh text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-40" />
      <DataLines className="absolute bottom-0 end-0 -z-10 w-[60%] opacity-50 rtl:-scale-x-100" />
      <div className={`${containerClasses} flex min-h-[80svh] flex-col justify-center py-40`}>
        <p className="text-gradient-gold text-[clamp(5rem,3rem+10vw,10rem)] font-black leading-none" aria-hidden>
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{t('title')}</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/70">{t('text')}</p>
        <Link href="/" className={buttonClasses('gold', 'lg', 'mt-8 w-fit')}>
          {t('home')}
        </Link>
        <p className="mt-12 text-sm font-bold text-white/60">{t('suggestions')}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={buttonClasses('outline-light', 'sm')}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
