import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { localizeDigits } from '@/lib/format';

/** Numbered vertical/horizontal timeline. Each step gets an #step-n anchor (used by HowTo JSON-LD). */
export function StepsTimeline({
  locale,
  steps,
  className,
  orientation = 'horizontal',
  stepLabel,
}: {
  locale: Locale;
  steps: { title: string; text: string }[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  stepLabel?: (n: number) => string;
}) {
  if (orientation === 'vertical') {
    return (
      <ol className={cn('relative space-y-6', className)}>
        <span aria-hidden className="absolute inset-y-6 start-7 w-px bg-gradient-to-b from-teal-300 via-gold-300 to-teal-200" />
        {steps.map((s, i) => (
          <li key={s.title} id={`step-${i + 1}`} className="relative flex scroll-mt-28 gap-6" data-reveal style={{ '--reveal-delay': i * 70 } as React.CSSProperties}>
            <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-navy-mesh text-xl font-black text-gold-300 shadow-lift ring-4 ring-white">
              {localizeDigits(i + 1, locale)}
            </span>
            <div className="flex-1 rounded-3xl border border-line bg-white p-6 shadow-card">
              {stepLabel && <p className="text-xs font-bold text-teal-700">{stepLabel(i + 1)}</p>}
              <h3 className="mt-1 text-lg font-extrabold text-navy-900">{s.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-8 text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ol className={cn('relative grid gap-6', steps.length >= 5 ? 'md:grid-cols-5' : 'md:grid-cols-4', className)}>
      <span aria-hidden className="absolute inset-x-[8%] top-7 hidden h-px bg-gradient-to-r from-teal-200 via-gold-300 to-teal-200 md:block" />
      {steps.map((s, i) => (
        <li key={s.title} className="relative" data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
          <span className="relative z-10 grid size-14 place-items-center rounded-2xl border border-line bg-white text-lg font-black shadow-card">
            <span className="text-gradient-teal">{localizeDigits(i + 1, locale)}</span>
          </span>
          <h3 className="mt-5 text-base font-extrabold text-navy-900">{s.title}</h3>
          <p className="mt-2 text-[0.9rem] leading-7 text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
