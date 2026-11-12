import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cn } from '@sabano/ui';
import { LinkedinLogoIcon } from '@/components/icons';
import { CtaBand } from '@/components/sections/CtaBand';
import { PageHero } from '@/components/sections/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/ui/Section';
import { getPeople } from '@/lib/data';
import { itemListLd, personLd, webPageLd } from '@/lib/jsonld';
import { readLocale, type LocaleParams } from '@/lib/params';
import { buildMetadata, ogImageFor } from '@/lib/seo';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = await getTranslations({ locale, namespace: 'leadership.meta' });
  return buildMetadata({ locale, path: '/leadership', title: t('title'), description: t('description'), image: ogImageFor(locale, 'leadership') });
}

export default async function LeadershipPage({ params }: LocaleParams) {
  const locale = await readLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'leadership' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const ta = await getTranslations({ locale, namespace: 'about' });
  const people = getPeople(locale);
  const groups = [
    { key: 'management', label: t('management'), people: people.filter((p) => p.group === 'management') },
    { key: 'board', label: t('board'), people: people.filter((p) => p.group === 'board') },
  ].filter((g) => g.people.length);

  return (
    <>
      <JsonLd
        data={[
          webPageLd({ locale, path: '/leadership', name: t('meta.title'), description: t('meta.description') }),
          itemListLd(people.map((p) => ({ name: p.name, item: personLd({ name: p.name, jobTitle: p.role, image: p.photo, sameAs: p.linkedin }) }))),
        ]}
      />
      <PageHero
        locale={locale}
        crumbs={[
          { label: tn('about'), href: '/about' },
          { label: tn('leadership'), href: '/leadership' },
        ]}
        kicker={t('hero.kicker')}
        title={t('hero.title')}
        lead={t('hero.lead')}
      />
      <Section>
        {groups.map((g) => (
          <div key={g.key} className="mb-16 last:mb-0">
            <h2 className="flex items-center gap-4 text-xl font-extrabold text-navy-900" data-reveal>
              {g.label}
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-line rtl:bg-gradient-to-r" />
            </h2>
            <ul className={cn('mt-8 grid gap-6', g.key === 'management' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3')}>
              {g.people.map((p, i) => (
                <li key={p.id} data-reveal style={{ '--reveal-delay': i * 90 } as React.CSSProperties}>
                  <article className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                    <div className="relative aspect-[4/4.2] overflow-hidden bg-navy-mesh">
                      {p.photo ? (
                        <Image
                          src={p.photo}
                          alt={p.name}
                          fill
                          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover grayscale-[20%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <span className="text-gradient-gold text-8xl font-black">{p.name.slice(0, 1)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <h3 className="text-xl font-extrabold">{p.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-gold-300">{p.role}</p>
                      </div>
                    </div>
                    {(p.bio || p.linkedin) && (
                      <div className="flex items-start justify-between gap-4 p-6">
                        {p.bio ? <p className="text-sm leading-7 text-muted">{p.bio}</p> : <span />}
                        {p.linkedin && (
                          <a
                            href={p.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('linkedin', { name: p.name })}
                            className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-[#0a66c2] transition-colors hover:border-[#0a66c2] hover:bg-[#0a66c2] hover:text-white"
                          >
                            <LinkedinLogoIcon weight="fill" className="size-5" aria-hidden />
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>
      <CtaBand title={ta('cta.title')} text={ta('cta.text')} primary={{ href: '/cooperation', label: ta('cta.button') }} secondary={{ href: '/contact', label: tc('contactUs') }} />
    </>
  );
}
