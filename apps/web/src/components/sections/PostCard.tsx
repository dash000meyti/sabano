import Image from 'next/image';
import type { PostCard as Post } from '@sabano/db';
import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { Link } from '@/i18n/navigation';
import { formatDate, localizeDigits } from '@/lib/format';
import { CalendarIcon, ClockIcon } from '../icons';

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
  featured?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift',
        featured && 'lg:flex-row',
      )}
      data-reveal
    >
      <div className={cn('relative aspect-[16/10] overflow-hidden bg-navy-900', featured && 'lg:aspect-auto lg:w-1/2')}>
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.coverAlt ?? ''}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : undefined}
            sizes={featured ? '(min-width: 1024px) 600px, 100vw' : '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
        <span className="absolute start-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy-900 backdrop-blur">
          {categoryLabel}
        </span>
      </div>
      <div className={cn('flex flex-1 flex-col p-6', featured && 'lg:justify-center lg:p-10')}>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon weight="duotone" className="size-4 text-teal-600" aria-hidden />
            <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt, locale)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon weight="duotone" className="size-4 text-teal-600" aria-hidden />
            {minutesLabel.replace('{count}', localizeDigits(post.readingMinutes, locale))}
          </span>
        </div>
        <h3 className={cn('mt-3 font-extrabold leading-8 text-navy-900', featured ? 'text-2xl leading-10' : 'text-lg')}>
          <Link href={`/news/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-[0.93rem] leading-7 text-muted">{post.excerpt}</p>
      </div>
    </article>
  );
}
