import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listPosts } from '@sabano/db';
import { buttonClasses, containerClasses } from '@sabano/ui';
import { SetAlternates } from '@/components/layout/SetAlternates';
import { CalendarIcon, ClockIcon } from '@/components/icons';
import { PostCard } from '@/components/sections/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { ForwardArrow } from '@/components/ui/ArrowIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Aurora } from '@/components/decor/Aurora';
import { Kicker, Section } from '@/components/ui/Section';
import { categoryVisuals } from '@/components/visual-maps';
import { Words } from '@/components/ui/Words';
import { Link } from '@/i18n/navigation';
import { getPostBySlug } from '@/lib/data';
import { formatDate, localizeDigits } from '@/lib/format';
import { withHeadingIds } from '@/lib/html';
import { articleLd, webPageLd } from '@/lib/jsonld';
import { toLocale, type LocaleSlugParams } from '@/lib/params';
import { buildMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: LocaleSlugParams): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = toLocale(l);
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
  const locale = toLocale(l);
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
        <header className="grain relative isolate overflow-hidden bg-hero text-fg">
          <Aurora intensity={0.9} />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial" />
          <div className={`${containerClasses} pb-40 pt-36 sm:pt-40`}>
            <Breadcrumbs
              locale={locale}
              items={[
                { label: tn('news'), href: '/news' },
                { label: post.title, href: `/news/${slug}` },
              ]}
            />
            <div className="mx-auto mt-10 max-w-3xl text-center">
              <Kicker icon={categoryVisuals[post.category].icon} anim={categoryVisuals[post.category].anim} className="justify-center">
                {t(`categories.${post.category}`)}
              </Kicker>
              <h1 className="mt-6 text-[clamp(1.9rem,1.2rem+2.6vw,3.4rem)] font-black leading-[1.25]">
                <Words mode="intro" text={post.title} delay={120} wordClassName={() => 'text-sheen'} />
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-fg-muted">{post.excerpt}</p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon weight="duotone" className="size-4.5 text-accent" aria-hidden />
                  <time dateTime={post.publishedAt.toISOString()}>{t('published', { date: formatDate(post.publishedAt, locale) })}</time>
                </span>
                {showUpdated && (
                  <span>
                    <time dateTime={post.updatedAt.toISOString()}>{t('updated', { date: formatDate(post.updatedAt, locale) })}</time>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon weight="duotone" className="size-4.5 text-accent" aria-hidden />
                  {tc('minutesRead', { count: localizeDigits(post.readingMinutes, locale) })}
                </span>
              </div>
            </div>
          </div>
        </header>
        {post.coverImage && (
          <div className={`${containerClasses} relative -mt-28`}>
            <div className="relative mx-auto aspect-[21/9] max-w-5xl overflow-hidden rounded-[2.25rem] shadow-[0_50px_100px_-40px_rgb(2_10_24/0.8)] ring-1 ring-edge" data-reveal="scale">
              <Image src={post.coverImage} alt={post.coverAlt ?? ''} fill priority fetchPriority="high" sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </div>
          </div>
        )}
        <div className={`${containerClasses} py-16`}>
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_15rem]">
            <div className="prose-sabano min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
            {toc.length > 1 && (
              <aside className="order-first lg:order-none">
                <nav aria-label={t('toc')} className="rounded-[1.75rem] border border-edge bg-card p-6 shadow-card lg:sticky lg:top-28">
                  <p className="text-sm font-extrabold text-fg">{t('toc')}</p>
                  <ol className="mt-4 space-y-2 text-sm">
                    {toc.map((x) => (
                      <li key={x.id} className={x.level === 3 ? 'ps-4' : undefined}>
                        <a href={`#${x.id}`} className="leading-6 text-fg-muted transition-colors hover:text-accent">
                          {x.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            )}
          </div>
          <div className="scheme-dark grain border-glow relative isolate mx-auto mt-16 max-w-5xl overflow-hidden rounded-[2.25rem] bg-night p-6 text-fg sm:p-12">
            <Aurora intensity={1} />
            <h2 className="text-2xl font-black">{t('endCta.title')}</h2>
            <p className="mt-3 text-fg-muted">{t('endCta.text')}</p>
            <Link href="/cooperation" data-magnetic className={buttonClasses('gold', 'lg', 'mt-7')}>
              {t('endCta.button')}
              <ForwardArrow />
            </Link>
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <Section tone="surface" labelledBy="related-title">
          <div className="flex items-end justify-between gap-4">
            <h2 id="related-title" className="text-2xl font-extrabold text-fg">
              {t('related')}
            </h2>
            <Link href="/news" className="inline-flex min-h-10 items-center text-sm font-bold text-accent">
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
