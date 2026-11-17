import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { faqCategories } from '@sabano/db';
import { buttonClasses } from '@sabano/ui';
import { ChatsCircleIcon, QuestionIcon } from '@/components/icons';
import { FaqExplorer } from '@/components/sections/FaqExplorer';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { Aurora } from '@/components/decor/Aurora';
import { IconTile, Section } from '@/components/ui/Section';
import { heroVisuals } from '@/components/visual-maps';
import { Link } from '@/i18n/navigation';
import { getFaqs } from '@/lib/data';
import { faqLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'faq.meta' });
  return buildMetadata({ locale, path: '/faq', title: t('title'), description: t('description'), image: ogImageFor(locale, 'faq') });
}

export default async function FaqPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const faqs = getFaqs(locale);
  const cats = faqCategories.filter((c) => faqs.some((f) => f.category === c)).map((c) => ({ key: c, label: t(`categories.${c}`) }));

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/faq', name: t('meta.title'), description: t('meta.description'), type: 'FAQPage' }),
          faqLd(faqs.map((f) => ({ q: f.question, a: f.answer })), locale),
        ]}
      />
      <PageHero locale={locale} crumbs={[{ label: tn('faq'), href: '/faq' }]} kicker={t('hero.kicker')} icon={QuestionIcon} anim="swing" visual={heroVisuals.faq} title={t('hero.title')} lead={t('hero.lead')} />
      <Section tone="surface">
        <FaqExplorer faqs={faqs} categories={cats} />
        <div className="scheme-dark grain border-glow relative isolate mt-16 flex flex-col items-start gap-6 overflow-hidden rounded-[2rem] bg-night p-6 text-fg sm:flex-row sm:items-center sm:justify-between sm:p-11" data-reveal>
          <Aurora intensity={0.9} />
          <div className="flex items-center gap-5">
            <IconTile icon={ChatsCircleIcon} anim="tilt" trigger="always" shape="blob" size="lg" />
            <div>
              <h2 className="text-xl font-black">{t('still.title')}</h2>
              <p className="mt-1 text-[0.98rem] text-fg-muted">{t('still.text')}</p>
            </div>
          </div>
          <Link href="/contact" data-magnetic className={buttonClasses('gold', 'lg', 'shrink-0 max-sm:w-full')}>
            {t('still.cta')}
          </Link>
        </div>
      </Section>
    </>
  );
}
