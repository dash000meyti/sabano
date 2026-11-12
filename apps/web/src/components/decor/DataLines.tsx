import { cn } from '@sabano/ui';

/*
 * Decorative brand graphics served as static SVG files (animated internally,
 * paused under prefers-reduced-motion). Using <img> keeps them out of the HTML
 * and the RSC payload, and lets the browser cache them across pages.
 */

/** Animated "market lines" — rising data series with glowing nodes. */
export function DataLines({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/decor/data-lines.svg" alt="" aria-hidden width={640} height={400} loading="lazy" decoding="async" className={cn('pointer-events-none select-none', className)} />;
}

/** The dot-and-dash "signal rows" from the Sabano mark, used as a brand texture. */
export function SignalRows({ className }: { className?: string; rows?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/decor/signal-rows.svg" alt="" aria-hidden width={160} height={160} loading="lazy" decoding="async" className={cn('pointer-events-none select-none', className)} />;
}
