import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { localizeDigits } from '@/lib/format';
import { AnimatedIcon, type AnimatedIconSpec } from '../ui/AnimatedIcon';

const n2 = (n: number, locale: Locale) => localizeDigits(String(n).padStart(2, '0'), locale);

/** Step marker: an animated icon in a tile with the step number as a gold badge (or just the number). */
function Marker({ i, locale, spec, className }: { i: number; locale: Locale; spec?: AnimatedIconSpec; className?: string }) {
  return (
    <span className={cn('relative z-[1] grid size-14 shrink-0 place-items-center rounded-[1.15rem] bg-card shadow-card ring-1 ring-edge sm:size-[4.3rem] sm:rounded-[1.4rem]', className)}>
      {spec ? (
        <>
          <span aria-hidden className="absolute inset-[5px] rounded-[1.1rem] bg-[linear-gradient(150deg,var(--accent-soft),transparent_70%)]" />
          <AnimatedIcon icon={spec.icon} anim={spec.anim} className="relative text-accent" iconClassName="size-7 sm:size-8" />
          <span className="tabular absolute -end-2 -top-2 grid size-7 place-items-center rounded-full bg-[linear-gradient(145deg,#f7dfa8,#eab543_60%,#c48a22)] text-[0.72rem] font-black text-midnight shadow-gold">
            {localizeDigits(String(i + 1), locale)}
          </span>
        </>
      ) : (
        <span className="text-brand text-xl font-black">{n2(i + 1, locale)}</span>
      )}
    </span>
  );
}

/** Numbered timeline. Vertical steps get #step-n anchors (used by HowTo JSON-LD) and a scroll-filled rail. */
export function StepsTimeline({
  locale,
  steps,
  className,
  orientation = 'horizontal',
  stepLabel,
  icons,
}: {
  locale: Locale;
  steps: { title: string; text: string }[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  stepLabel?: (n: number) => string;
  /** One animated icon per step (falls back to the step number) */
  icons?: AnimatedIconSpec[];
}) {
  if (orientation === 'vertical') {
    return (
      <ol className={cn('rail-scope relative space-y-5', className)}>
        <span aria-hidden className="absolute inset-y-8 start-7 w-px bg-edge sm:start-[2.15rem]" />
        <span aria-hidden className="rail-fill absolute inset-y-8 start-7 w-px bg-gradient-to-b from-teal-400 via-gold-400 to-teal-500 sm:start-[2.15rem]" />
        {steps.map((s, i) => (
          <li key={s.title} id={`step-${i + 1}`} className="group relative flex scroll-mt-28 gap-3.5 sm:gap-6" data-reveal style={{ '--reveal-delay': i * 70 } as React.CSSProperties}>
            <Marker i={i} locale={locale} spec={icons?.[i]} />
            <div className="spotlight min-w-0 flex-1 overflow-hidden rounded-[1.5rem] border border-edge bg-card p-5 shadow-card transition-transform duration-500 group-hover:-translate-y-1 sm:rounded-[1.75rem] sm:p-7">
              {stepLabel && <p className="relative z-[1] text-xs font-bold text-accent">{stepLabel(i + 1)}</p>}
              <h3 className="relative z-[1] mt-1 text-lg font-black text-fg sm:text-xl">{s.title}</h3>
              <p className="relative z-[1] mt-2 text-[0.95rem] leading-7 text-fg-muted sm:text-[0.98rem] sm:leading-8">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ol className={cn('relative grid gap-5 sm:grid-cols-2', steps.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4', className)}>
      <span aria-hidden className="absolute inset-x-[10%] top-[2.15rem] hidden h-px bg-gradient-to-r from-teal-300 via-gold-300 to-teal-300 lg:block" />
      {steps.map((s, i) => (
        <li key={s.title} className="group relative flex gap-4 lg:block" data-reveal style={{ '--reveal-delay': i * 90 } as React.CSSProperties}>
          <Marker i={i} locale={locale} spec={icons?.[i]} />
          <div className="spotlight min-w-0 flex-1 overflow-hidden rounded-[1.5rem] border border-edge bg-card p-5 shadow-card transition-transform duration-500 group-hover:-translate-y-1 sm:p-6 lg:mt-5">
            <h3 className="relative z-[1] text-lg font-black text-fg">{s.title}</h3>
            <p className="relative z-[1] mt-2 text-[0.92rem] leading-7 text-fg-muted">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
