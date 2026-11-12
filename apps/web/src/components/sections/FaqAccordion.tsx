import { cn } from '@sabano/ui';

/** Accessible, JS-free accordion. Answers stay in the HTML so crawlers and answer engines read them. */
export function FaqAccordion({
  items,
  className,
  headingLevel = 'h3',
  defaultOpen = 0,
}: {
  items: { q: string; a: string; id?: string }[];
  className?: string;
  headingLevel?: 'h2' | 'h3';
  defaultOpen?: number | null;
}) {
  const H = headingLevel;
  return (
    <div className={cn('divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white', className)}>
      {items.map((f, i) => (
        <details key={f.id ?? i} id={f.id} className="group/faq" open={defaultOpen === i}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 transition-colors hover:bg-surface/70">
            <H className="text-[1rem] font-bold leading-8 text-navy-900">{f.q}</H>
            <span
              aria-hidden
              className="relative grid size-8 shrink-0 place-items-center rounded-full border border-line text-teal-700 transition-all group-open/faq:rotate-45 group-open/faq:border-teal-500 group-open/faq:bg-teal-500 group-open/faq:text-white"
            >
              <span className="absolute h-0.5 w-3 rounded bg-current" />
              <span className="absolute h-3 w-0.5 rounded bg-current" />
            </span>
          </summary>
          <div className="px-6 pb-6 text-[0.98rem] leading-8 text-muted">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
