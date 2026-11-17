import Image from 'next/image';
import type { PostCard as Post } from '@sabano/db';
import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { Link } from '@/i18n/navigation';
import { formatDate, localizeDigits } from '@/lib/format';
import { ArrowUpRightIcon, CalendarIcon, ClockIcon } from '../icons';

/**
 * Article card. `featured`: true/'wide' = horizontal hero card, 'tall' = big card with overlay text,
 * 'row' = compact horizontal card.
 */
export function PostCard({
  post,
  locale,
  categoryLabel,
  minutesLabel,
  featured,
  priority,
}: {
  post: Post;
  locale: Locale;
  categoryLabel: string;
  minutesLabel: string;
  featured?: boolean | 'wide' | 'tall' | 'row';
  priority?: boolean;
}) {
  const mode = featured === true ? 'wide' : featured || 'card';
  const meta = (
    <div className={cn('flex flex-wrap items-center gap-4 text-xs', mode === 'tall' ? 'text-fg-muted' : 'text-fg-muted')}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon weight="duotone" className={cn('size-4', mode === 'tall' ? 'text-accent' : 'text-accent')} aria-hidden />
        <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt, locale)}</time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <ClockIcon weight="duotone" className={cn('size-4', mode === 'tall' ? 'text-accent' : 'text-accent')} aria-hidden />
        {minutesLabel.replace('{count}', localizeDigits(post.readingMinutes, locale))}
      </span>
    </div>
  );
  const img = (sizes: string) =>
    post.coverImage && (
      <Image
        src={post.coverImage}
        alt={post.coverAlt ?? ''}
        fill
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
        sizes={sizes}
        className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
      />
    );
  const badge = (
    <span className="glass absolute start-4 top-4 z-[1] rounded-full px-3 py-1 text-xs font-bold text-fg">{categoryLabel}</span>
  );

  if (mode === 'tall') {
    return (
      <article className="group scheme-dark relative flex min-h-[30rem] overflow-hidden rounded-[2rem] bg-midnight shadow-lift" data-reveal>
        {img('(min-width: 1024px) 640px, 100vw')}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/55 to-transparent" />
        {badge}
        <div className="relative mt-auto p-6 sm:p-10">
          {meta}
          <h3 className="mt-4 text-[clamp(1.4rem,1.1rem+1vw,2rem)] font-black leading-snug text-fg">
            <Link href={`/news/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {post.title}
            </Link>
          </h3>
          <p className="mt-3 line-clamp-2 max-w-xl text-fg-muted">{post.excerpt}</p>
        </div>
        <span className="absolute end-6 top-6 grid size-12 place-items-center rounded-full bg-card text-midnight transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRightIcon weight="bold" className="size-5 rtl:-scale-x-100" aria-hidden />
        </span>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'group spotlight relative flex h-full overflow-hidden rounded-[2rem] border border-edge bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift',
        mode === 'card' && 'flex-col',
        mode === 'wide' && 'flex-col lg:flex-row',
        mode === 'row' && 'flex-col sm:flex-row',
      )}
      data-reveal
    >
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-navy-900',
          mode === 'card' && 'aspect-[16/10]',
          mode === 'wide' && 'aspect-[16/10] lg:aspect-auto lg:w-[55%]',
          mode === 'row' && 'aspect-[16/10] sm:aspect-auto sm:w-[42%]',
        )}
      >
        {img(mode === 'wide' ? '(min-width: 1024px) 700px, 100vw' : '(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw')}
        {badge}
      </div>
      <div className={cn('relative z-[1] flex flex-1 flex-col p-7', mode === 'wide' && 'lg:justify-center lg:p-12', mode === 'row' && 'justify-center')}>
        {meta}
        <h3 className={cn('mt-3 font-black leading-snug text-fg', mode === 'wide' ? 'text-[clamp(1.4rem,1.1rem+1vw,2.1rem)]' : 'text-lg')}>
          <Link href={`/news/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        <p className={cn('mt-3 text-[0.93rem] leading-7 text-fg-muted', mode === 'row' ? 'line-clamp-2' : 'line-clamp-3')}>{post.excerpt}</p>
      </div>
    </article>
  );
}
