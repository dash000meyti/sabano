import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonClasses } from '@sabano/ui';
import { SignalRows } from '@/components/decor/DataLines';
import { ClockIcon, EnvelopeSimpleIcon, MapPinIcon, NavigationArrowIcon, PhoneIcon } from '@/components/icons';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { IconTile, Section } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { getContact, getOrg, getSocial } from '@/lib/data';
import { formatPhone, localizeDigits, phoneHref } from '@/lib/format';
import { organizationLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { CopyButton } from './CopyButton';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'contact.meta' });
  return buildMetadata({ locale, path: '/contact', title: t('title'), description: t('description'), image: ogImageFor(locale, 'contact') });
}

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const contact = getContact();
  const address = contact.address[locale] ?? contact.address.en ?? '';
  const hours = contact.hours[locale];
  const query = encodeURIComponent(contact.address.fa ?? address);
  const maps = [
    { key: 'neshan', href: contact.lat ? `https://neshan.org/maps/@${contact.lat},${contact.lng},17z` : `https://neshan.org/maps/search/${query}` },
    { key: 'balad', href: contact.lat ? `https://balad.ir/location?latitude=${contact.lat}&longitude=${contact.lng}&zoom=17` : `https://balad.ir/search?query=${query}` },
    { key: 'google', href: contact.lat ? `https://www.google.com/maps?q=${contact.lat},${contact.lng}` : `https://www.google.com/maps/search/?api=1&query=${query}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/contact', name: t('meta.title'), description: t('meta.description'), type: 'ContactPage' }),
          organizationLd({
            locale,
            name: tc('orgName'),
            description: t('meta.description'),
            contact,
            social: getSocial(),
            org: getOrg(),
            services: [],
            knowsAbout: [],
          }),
        ]}
      />
      <PageHero locale={locale} crumbs={[{ label: tn('contact'), href: '/contact' }]} kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead', { email: contact.email })} />

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <section aria-labelledby="phone-title" className="rounded-[1.75rem] border border-line bg-white p-7 shadow-card" data-reveal>
            <IconTile>
              <PhoneIcon weight="duotone" aria-hidden />
            </IconTile>
            <h2 id="phone-title" className="mt-5 text-lg font-extrabold text-navy-900">
              {t('phone')}
            </h2>
            <ul className="mt-4 space-y-2">
              {contact.phones.map((p) => (
                <li key={p}>
                  <a href={phoneHref(p)} dir="ltr" className="block w-fit rounded-lg text-lg font-bold tracking-wide text-navy-800 transition-colors hover:text-teal-700 rtl:ms-auto rtl:text-end">
                    {formatPhone(p, locale)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="email-title" className="rounded-[1.75rem] border border-line bg-white p-7 shadow-card" data-reveal style={{ '--reveal-delay': 90 } as React.CSSProperties}>
            <IconTile>
              <EnvelopeSimpleIcon weight="duotone" aria-hidden />
            </IconTile>
            <h2 id="email-title" className="mt-5 text-lg font-extrabold text-navy-900">
              {t('email')}
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <a href={`mailto:${contact.email}`} dir="ltr" className="text-lg font-bold text-navy-800 hover:text-teal-700">
                {contact.email}
              </a>
              <CopyButton value={contact.email} />
            </div>
            {hours && (
              <div className="mt-8 border-t border-line pt-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-navy-900">
                  <ClockIcon weight="duotone" className="size-5 text-teal-600" aria-hidden />
                  {t('hours')}
                </h3>
                <p className="mt-2 text-[0.95rem] text-muted">{hours}</p>
              </div>
            )}
          </section>
          <section aria-labelledby="address-title" className="relative overflow-hidden rounded-[1.75rem] bg-navy-mesh p-7 text-white shadow-lift" data-reveal style={{ '--reveal-delay': 180 } as React.CSSProperties}>
            <SignalRows className="absolute -bottom-2 end-2 w-28 opacity-20" rows={6} />
            <IconTile tone="dark">
              <MapPinIcon weight="duotone" aria-hidden />
            </IconTile>
            <h2 id="address-title" className="mt-5 text-lg font-extrabold">
              {t('address')}
            </h2>
            <address className="mt-3 text-[0.95rem] not-italic leading-8 text-white/85">{address}</address>
            <p className="mt-3 text-sm text-white/65">
              {t('postalCode')}: <span className="font-bold text-white">{localizeDigits(contact.postalCode, locale)}</span>
            </p>
            <div className="mt-6">
              <p className="text-xs font-bold text-gold-300">{t('directions')}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {maps.map((m) => (
                  <li key={m.key}>
                    <a href={m.href} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline-light', 'sm')}>
                      <NavigationArrowIcon weight="duotone" className="size-4" aria-hidden />
                      {t(`maps.${m.key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col items-start gap-6 rounded-[2rem] border border-line bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10" data-reveal>
          <div>
            <h2 className="text-xl font-extrabold text-navy-900">{t('formCta.title')}</h2>
            <p className="mt-2 text-[0.98rem] text-muted">{t('formCta.text')}</p>
          </div>
          <Link href="/cooperation" className={buttonClasses('gold', 'lg')}>
            {t('formCta.button')}
            <ForwardArrow />
          </Link>
        </div>
      </Section>
    </>
  );
}
