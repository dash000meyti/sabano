import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SignalRows } from '@/components/decor/DataLines';
import { CheckCircleIcon, EnvelopeSimpleIcon, LightbulbIcon, WarningIcon } from '@/components/icons';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/ui/Section';
import { getContact } from '@/lib/data';
import { webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';
import { CooperationForm } from './CooperationForm';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'cooperation.meta' });
  return buildMetadata({ locale, path: '/cooperation', title: t('title'), description: t('description'), image: ogImageFor(locale, 'cooperation') });
}

export default async function CooperationPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'cooperation' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const contact = getContact();
  const items = t.raw('whatToSend.items') as string[];
  const tips = t.raw('tips') as string[];

  return (
    <>
      <JsonLd data={webPageLd({ locale, path: '/cooperation', name: t('meta.title'), description: t('meta.description'), type: 'ContactPage' })} />
      <PageHero locale={locale} crumbs={[{ label: tn('cooperation'), href: '/cooperation' }]} kicker={t('hero.kicker')} title={t('hero.title')} lead={t('hero.lead')} compact />
      <Section id="application" className="pt-14 sm:pt-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-10">
            <h2 className="mb-8 text-2xl font-extrabold text-navy-900">{t('form.title')}</h2>
            <CooperationForm email={contact.email} />
          </div>
          <aside className="space-y-5">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-navy-mesh p-7 text-white shadow-lift">
              <SignalRows className="absolute -bottom-2 end-2 w-28 opacity-25" rows={6} />
              <h2 className="text-base font-extrabold">{t('whatToSend.title')}</h2>
              <ul className="mt-5 space-y-3">
                {items.map((i) => (
                  <li key={i} className="flex gap-2.5 text-[0.92rem] leading-7 text-white/85">
                    <CheckCircleIcon weight="fill" className="mt-1 size-4.5 shrink-0 text-teal-400" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-line bg-surface p-7">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-navy-900">
                <LightbulbIcon weight="duotone" className="size-6 text-gold-500" aria-hidden />
                {t('tipsTitle')}
              </h2>
              <ol className="mt-4 space-y-2.5 text-[0.9rem] leading-7 text-navy-800">
                {tips.map((tip, i) => (
                  <li key={tip} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-400 text-[0.7rem] font-black text-navy-950">
                      {locale === 'fa' ? '۱۲۳'[i] : i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>
            <p className="flex gap-2.5 rounded-[1.75rem] border border-gold-200 bg-gold-50 p-6 text-[0.85rem] leading-7 text-navy-800">
              <WarningIcon weight="duotone" className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
              {t('disclaimer')}
            </p>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 rounded-[1.75rem] border border-line bg-white p-5 text-sm font-bold text-navy-900 hover:border-teal-300">
              <EnvelopeSimpleIcon weight="duotone" className="size-6 text-teal-600" aria-hidden />
              {t('responseEmail')}{' '}
              <span dir="ltr">{contact.email}</span>
            </a>
          </aside>
        </div>
      </Section>
    </>
  );
}
