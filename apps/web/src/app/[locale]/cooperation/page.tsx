import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Aurora } from '@/components/decor/Aurora';
import { CheckCircleIcon, EnvelopeSimpleIcon, HandshakeIcon, LightbulbIcon, PaperPlaneTiltIcon, WarningIcon } from '@/components/icons';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { IconTile } from '@/components/ui/Section';
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
      <PageHero locale={locale} crumbs={[{ label: tn('cooperation'), href: '/cooperation' }]} kicker={t('hero.kicker')} icon={HandshakeIcon} anim="nod" title={t('hero.title')} lead={t('hero.lead')} compact />
      <Section id="application" tone="surface" className="pt-14 sm:pt-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="rounded-[2.25rem] border border-edge bg-card p-6 shadow-lift sm:p-11" data-reveal>
            <h2 className="mb-9 flex items-center gap-4 text-[1.7rem] font-black text-fg">
              <IconTile icon={PaperPlaneTiltIcon} anim="glide" trigger="always" shape="blob" />
              {t('form.title')}
            </h2>
            <CooperationForm email={contact.email} />
          </div>
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="scheme-dark grain border-glow relative isolate overflow-hidden rounded-[2rem] bg-night p-6 text-fg shadow-lift sm:p-8">
              <Aurora intensity={0.9} />
              <h2 className="flex items-center gap-3 text-lg font-black">
                <IconTile icon={CheckCircleIcon} anim="beat" trigger="always" size="sm" shape="circle" />
                {t('whatToSend.title')}
              </h2>
              <ul className="mt-5 space-y-3">
                {items.map((i) => (
                  <li key={i} className="flex gap-2.5 text-[0.92rem] leading-7 text-fg/85">
                    <CheckCircleIcon weight="fill" className="mt-1 size-4.5 shrink-0 text-accent" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2rem] border border-edge bg-card p-6 shadow-card sm:p-8">
              <h2 className="flex items-center gap-3 text-base font-extrabold text-fg">
                <IconTile icon={LightbulbIcon} anim="swing" trigger="always" size="sm" tone="gold" shape="blob" />
                {t('tipsTitle')}
              </h2>
              <ol className="mt-4 space-y-2.5 text-[0.9rem] leading-7 text-fg">
                {tips.map((tip, i) => (
                  <li key={tip} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold-400 text-xs font-black text-navy-950">
                      {locale === 'fa' ? '۱۲۳'[i] : i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>
            <p className="flex gap-2.5 rounded-[2rem] border border-gold-edge bg-gold-soft p-6 text-[0.85rem] leading-7 text-fg">
              <AnimatedIcon icon={WarningIcon} anim="swing" className="mt-0.5 shrink-0 text-gold-ink" iconClassName="size-5" />
              {t('disclaimer')}
            </p>
            <a href={`mailto:${contact.email}`} className="group flex items-center gap-3 rounded-[2rem] border border-edge bg-card p-5 text-sm font-bold text-fg shadow-card hover:border-accent/40">
              <AnimatedIcon icon={EnvelopeSimpleIcon} anim="float" trigger="hover" className="text-accent" iconClassName="size-6" />
              {t('responseEmail')}{' '}
              <span dir="ltr">{contact.email}</span>
            </a>
          </aside>
        </div>
      </Section>
    </>
  );
}
