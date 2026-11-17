import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LockKeyIcon } from '@/components/icons';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/ui/Section';
import { getContact } from '@/lib/data';
import { webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'privacy.meta' });
  return buildMetadata({ locale, path: '/privacy', title: t('title'), description: t('description'), image: ogImageFor(locale, 'privacy') });
}

export default async function PrivacyPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const sections = t.raw('sections') as { title: string; text: string }[];
  const email = getContact().email;
  return (
    <>
      <JsonLd data={webPageLd({ locale, path: '/privacy', name: t('meta.title'), description: t('meta.description') })} />
      <PageHero locale={locale} crumbs={[{ label: tn('privacy'), href: '/privacy' }]} kicker={t('hero.kicker')} icon={LockKeyIcon} anim="pop" title={t('hero.title')} lead={t('hero.lead')} compact />
      <Section>
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.title} aria-labelledby={`p-${i}`} data-reveal>
              <h2 id={`p-${i}`} className="text-xl font-extrabold text-fg">
                {s.title}
              </h2>
              <p className="mt-3 text-[1.02rem] leading-9 text-fg-muted">{s.text.replace('{email}', email)}</p>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
