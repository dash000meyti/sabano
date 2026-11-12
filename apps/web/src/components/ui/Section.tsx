import { cn, containerClasses } from '@sabano/ui';

type Tone = 'light' | 'surface' | 'navy';

export function Section({
  tone = 'light',
  className,
  innerClassName,
  id,
  children,
  labelledBy,
}: {
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  id?: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative py-20 sm:py-24 lg:py-28',
        tone === 'surface' && 'bg-surface',
        tone === 'navy' && 'overflow-hidden bg-navy-mesh text-white',
        className,
      )}
    >
      {tone === 'navy' && <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />}
      <div className={cn(containerClasses, 'relative', innerClassName)}>{children}</div>
    </section>
  );
}

export function Kicker({ children, tone = 'dark', className }: { children: React.ReactNode; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2.5 text-[0.8rem] font-bold tracking-wide',
        tone === 'dark' ? 'text-teal-700' : 'text-teal-300',
        className,
      )}
    >
      <span className="relative flex h-1.5 w-7 items-center" aria-hidden>
        <span className="h-px w-full bg-gradient-to-r from-gold-400 to-teal-400 rtl:bg-gradient-to-l" />
        <span className="absolute end-0 size-1.5 rounded-full bg-gold-400" />
      </span>
      {children}
    </p>
  );
}

export function SectionHeader({
  kicker,
  title,
  text,
  id,
  tone = 'dark',
  action,
  align = 'start',
  as: As = 'h2',
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  text?: React.ReactNode;
  id?: string;
  tone?: 'dark' | 'light';
  action?: React.ReactNode;
  align?: 'start' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
      data-reveal
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
        <As
          id={id}
          className={cn(
            'mt-3 text-[clamp(1.7rem,1.2rem+1.8vw,2.6rem)] font-extrabold',
            tone === 'dark' ? 'text-navy-900' : 'text-white',
          )}
        >
          {title}
        </As>
        {text && <p className={cn('mt-4 text-[1.02rem] leading-8', tone === 'dark' ? 'text-muted' : 'text-white/70')}>{text}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function IconTile({
  children,
  tone = 'light',
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  tone?: 'light' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center rounded-2xl',
        size === 'sm' && 'size-10 [&>svg]:size-5',
        size === 'md' && 'size-13 [&>svg]:size-6.5',
        size === 'lg' && 'size-16 [&>svg]:size-8',
        tone === 'light' && 'bg-gradient-to-br from-teal-50 via-white to-gold-50 text-teal-700 ring-1 ring-navy-900/5 shadow-[inset_0_1px_0_white]',
        tone === 'dark' && 'bg-white/8 text-teal-300 ring-1 ring-white/12',
        tone === 'gold' && 'bg-gradient-to-br from-gold-200 to-gold-400 text-navy-950',
        className,
      )}
    >
      {children}
    </span>
  );
}
