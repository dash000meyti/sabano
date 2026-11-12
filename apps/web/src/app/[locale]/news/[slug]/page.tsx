import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listPosts } from '@sabano/db';
import type { Locale } from '@sabano/i18n';
import { buttonClasses, containerClasses } from '@sabano/ui';
import { SetAlternates } from '@/components/layout/SetAlternates';
import { CalendarIcon, ClockIcon } from '@/components/icons';
import { PostCard } from '@/components/sections/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Kicker, Section } from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { getPostBySlug } from '@/lib/data';
import { formatDate, localizeDigits } from '@/lib/format';
import { withHeadingIds } from '@/lib/html';
import { articleLd, webPageLd } from '@/lib/jsonld';
import type { LocaleSlugParams } from '@/lib/params';
import { buildMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: LocaleSlugParams): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const post = getPostBySlug(slug, locale);
  if (!post) return {};
  return buildMetadata({
    locale,
    path: `/news/${slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage ?? undefined,
    imageAlt: post.coverAlt ?? undefined,
    type: 'article',
    availableLocales: post.locales,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function ArticlePage({ params }: LocaleSlugParams) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();
  const t = await getTranslations({ locale, namespace: 'news' });
  const tn = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const { html, toc } = withHeadingIds(post.body);
  const related = listPosts(locale, { limit: 4, excludeId: post.id }).items.slice(0, 3);
  const showUpdated = post.updatedAt.getTime() - post.publishedAt.getTime() > 24 * 3600 * 1000;

  return (
    <>
      <SetAlternates locales={post.locales} fallbackPath="/news" />
      <JsonLd
        data={[
          webPageLd({ locale, path: `/news/${slug}`, name: post.title, description: post.excerpt, dateModified: post.updatedAt }),
          articleLd({
            locale,
            path: `/news/${slug}`,
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            published: post.publishedAt,
            modified: post.updatedAt,
            section: t(`categories.${post.category}`),
            type: post.category === 'news' ? 'NewsArticle' : 'Article',
          }),
        ]}
      />
      <article>
        <header className="relative isolate overflow-hidden bg-navy-mesh text-white">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-40" />
          <div className={`${containerClasses} pb-40 pt-36 sm:pt-40`}>
            <Breadcrumbs
              locale={locale}
              items={[
                { label: tn('news'), href: '/news' },
                { label: post.title, href: `/news/${slug}` },
              ]}
            />
            <div className="mx-auto mt-10 max-w-3xl text-center">
              <Kicker tone="light" className="justify-center">
                {t(`categories.${post.category}`)}
              </Kicker>
              <h1 className="mt-4 text-[clamp(1.8rem,1.2rem+2.4vw,3rem)] font-extrabold leading-tight">{post.title}</h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-white/75">{post.excerpt}</p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm text-white/65">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon weight="duotone" className="size-4.5 text-teal-300" aria-hidden />
                  <time dateTime={post.publishedAt.toISOString()}>{t('published', { date: formatDate(post.publishedAt, locale) })}</time>
                </span>
                {showUpdated && (
                  <span>
                    <time dateTime={post.updatedAt.toISOString()}>{t('updated', { date: formatDate(post.updatedAt, locale) })}</time>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon weight="duotone" className="size-4.5 text-teal-300" aria-hidden />
                  {tc('minutesRead', { count: localizeDigits(post.readingMinutes, locale) })}
                </span>
              </div>
            </div>
          </div>
        </header>
        {post.coverImage && (
          <div className={`${containerClasses} relative -mt-28`}>
            <div className="relative mx-auto aspect-[21/9] max-w-5xl overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-white/20">
              <Image src={post.coverImage} alt={post.coverAlt ?? ''} fill priority fetchPriority="high" sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </div>
          </div>
        )}
        <div className={`${containerClasses} py-16`}>
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_15rem]">
            <div className="prose-sabano min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
            {toc.length > 1 && (
              <aside className="order-first lg:order-none">
                <nav aria-label={t('toc')} className="rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-28">
                  <p className="text-sm font-extrabold text-navy-900">{t('toc')}</p>
                  <ol className="mt-4 space-y-2 text-sm">
                    {toc.map((x) => (
                      <li key={x.id} className={x.level === 3 ? 'ps-4' : undefined}>
                        <a href={`#${x.id}`} className="leading-6 text-muted transition-colors hover:text-teal-700">
                          {x.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            )}
          </div>
          <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-[1.75rem] bg-navy-mesh p-8 text-white sm:p-10">
            <h2 className="text-xl font-extrabold">{t('endCta.title')}</h2>
            <p className="mt-3 text-white/75">{t('endCta.text')}</p>
            <Link href="/cooperation" className={buttonClasses('gold', 'md', 'mt-6')}>
              {t('endCta.button')}
              <ForwardArrow />
            </Link>
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <Section tone="surface" labelledBy="related-title">
          <div className="flex items-end justify-between gap-4">
            <h2 id="related-title" className="text-2xl font-extrabold text-navy-900">
              {t('related')}
            </h2>
            <Link href="/news" className="text-sm font-bold text-teal-700">
              {t('back')}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} locale={locale} categoryLabel={t(`categories.${p.category}`)} minutesLabel={tc.raw('minutesRead') as string} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
