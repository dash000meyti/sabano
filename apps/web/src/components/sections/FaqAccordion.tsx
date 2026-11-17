import { cn } from '@sabano/ui';

/** Accessible, JS-free accordion. Answers stay in the HTML so crawlers and answer engines read them. */
export function FaqAccordion({
  items,
  className,
  headingLevel = 'h3',
  defaultOpen = 0,
  tone = 'light',
}: {
  items: { q: string; a: string; id?: string }[];
  className?: string;
  headingLevel?: 'h2' | 'h3';
  defaultOpen?: number | null;
  tone?: 'light' | 'dark';
}) {
  const H = headingLevel;
  const dark = tone === 'dark';
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((f, i) => (
        <details
          key={f.id ?? i}
          id={f.id}
          className={cn(
            'group/faq overflow-hidden rounded-[1.5rem] border transition-all duration-500',
            dark ? 'border-edge bg-card open:bg-card-hover' : 'border-edge bg-card open:border-accent/40 open:shadow-lift',
          )}
          open={defaultOpen === i}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:gap-6 sm:px-7 sm:py-5">
            <H className={cn('text-[0.98rem] font-bold leading-8 sm:text-[1.02rem]', dark ? 'text-fg' : 'text-fg')}>{f.q}</H>
            <span
              aria-hidden
              className={cn(
                'relative grid size-9 shrink-0 place-items-center rounded-full transition-all duration-500 group-open/faq:rotate-[135deg]',
                dark ? 'bg-tint text-accent group-open/faq:bg-aqua-400 group-open/faq:text-midnight' : 'bg-canvas-alt text-accent group-open/faq:bg-fg group-open/faq:text-canvas',
              )}
            >
              <span className="absolute h-0.5 w-3.5 rounded bg-current" />
              <span className="absolute h-3.5 w-0.5 rounded bg-current" />
            </span>
          </summary>
          <div className={cn('px-5 pb-6 text-[0.96rem] leading-8 sm:px-7 sm:text-[0.98rem]', dark ? 'text-fg-muted' : 'text-fg-muted')}>{f.a}</div>
        </details>
      ))}
    </div>
  );
}
