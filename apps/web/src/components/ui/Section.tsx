import { cn, containerClasses } from '@sabano/ui';
import { Aurora } from '../decor/Aurora';
import { SparkleIcon } from '../icons';
import { AnimatedIcon, type IconAnim, type IconComponent } from './AnimatedIcon';
import { Words } from './Words';

type Tone = 'light' | 'surface' | 'navy' | 'dark';

export function Section({
  tone = 'light',
  className,
  innerClassName,
  id,
  children,
  labelledBy,
  aurora,
}: {
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  id?: string;
  children: React.ReactNode;
  labelledBy?: string;
  aurora?: boolean;
}) {
  const dark = tone === 'navy' || tone === 'dark';
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative isolate py-24 sm:py-28 lg:py-36',
        tone === 'surface' && 'bg-canvas-alt',
        tone === 'light' && 'bg-canvas',
        dark && 'grain overflow-hidden bg-hero text-fg',
        className,
      )}
    >
      {dark && (
        <>
          {aurora !== false && <Aurora intensity={0.8} />}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial opacity-70" />
        </>
      )}
      <div className={cn(containerClasses, 'relative z-[2]', innerClassName)}>{children}</div>
    </section>
  );
}

/**
 * Pill label above headings. The chip holds a section-specific icon with its own motion
 * (compass spins, rocket launches…) and a small gold spark orbiting it.
 */
export function Kicker({
  children,
  className,
  index,
  icon = SparkleIcon,
  anim = 'twinkle',
}: {
  children: React.ReactNode;
  /** @deprecated colours follow the theme */
  tone?: 'dark' | 'light';
  className?: string;
  index?: string;
  icon?: IconComponent;
  anim?: IconAnim;
}) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-edge bg-card py-1.5 pe-4 ps-1.5 text-[0.8rem] font-bold text-accent shadow-[0_6px_18px_-10px_rgb(6_33_64/0.35)] backdrop-blur',
        className,
      )}
    >
      <span className="orbit-spark relative grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,var(--accent-soft),transparent_80%)] ring-1 ring-accent/25">
        <AnimatedIcon icon={icon} anim={anim} iconClassName="size-4" />
      </span>
      {index && <span className="tabular text-fg-subtle">{index}</span>}
      {children}
    </p>
  );
}

export function SectionHeader({
  kicker,
  title,
  text,
  id,
  action,
  align = 'start',
  as: As = 'h2',
  className,
  index,
  size = 'lg',
  highlight = 0,
  icon,
  anim,
}: {
  kicker?: string;
  /** Kicker icon and its motion */
  icon?: IconComponent;
  anim?: IconAnim;
  title: React.ReactNode;
  text?: React.ReactNode;
  id?: string;
  /** @deprecated colours follow the theme */
  tone?: 'dark' | 'light';
  action?: React.ReactNode;
  align?: 'start' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  index?: string;
  size?: 'md' | 'lg' | 'xl';
  /** Number of trailing words rendered with the accent gradient */
  highlight?: number;
}) {
  const sizeCls =
    size === 'xl'
      ? 'text-[clamp(2.2rem,1.2rem+4vw,4.6rem)]'
      : size === 'md'
        ? 'text-[clamp(1.6rem,1.2rem+1.4vw,2.3rem)]'
        : 'text-[clamp(1.95rem,1.2rem+2.8vw,3.6rem)]';
  return (
    <div className={cn('flex flex-col gap-8', align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between', className)}>
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto flex flex-col items-center')}>
        {kicker && (
          <div data-reveal>
            <Kicker index={index} icon={icon} anim={anim}>
              {kicker}
            </Kicker>
          </div>
        )}
        <As id={id} className={cn('mt-5 font-black leading-[1.15] text-fg', sizeCls)}>
          {typeof title === 'string' ? (
            <Words
              text={title}
              wordClassName={(_, i, n) => (highlight && i >= n - highlight ? 'text-gold' : undefined)}
            />
          ) : (
            title
          )}
        </As>
        {text && (
          <p className={cn('mt-5 max-w-2xl text-[1.05rem] leading-8 text-fg-muted sm:text-lg sm:leading-9', align === 'center' && 'mx-auto')} data-reveal style={{ '--reveal-delay': 150 } as React.CSSProperties}>
            {text}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0" data-reveal style={{ '--reveal-delay': 250 } as React.CSSProperties}>
          {action}
        </div>
      )}
    </div>
  );
}

export type TileShape = 'squircle' | 'circle' | 'hex' | 'blob' | 'diamond';

const GOLD_SURFACE = 'bg-[linear-gradient(145deg,#f7dfa8,#eab543_55%,#c48a22)] text-midnight shadow-gold';

/**
 * Icon badge. Shapes vary by section (squircle, circle with orbit ring, hexagon,
 * morphing blob, diamond) so the page doesn't read as rows of identical boxes.
 * Pass `icon` + `anim` for a moving icon; by default it wakes up when its `.group` card is hovered.
 */
export function IconTile({
  icon,
  anim = 'float',
  trigger = 'hover',
  weight = 'duotone',
  children,
  tone = 'light',
  size = 'md',
  shape = 'squircle',
  className,
}: {
  icon?: IconComponent;
  anim?: IconAnim;
  trigger?: 'always' | 'hover';
  weight?: 'duotone' | 'fill' | 'bold';
  children?: React.ReactNode;
  /** 'light' and 'dark' both follow the theme; 'gold' is the accent tile. */
  tone?: 'light' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: TileShape;
  className?: string;
}) {
  const gold = tone === 'gold';
  const sizeCls = {
    sm: 'size-10 [&_svg]:size-5',
    md: 'size-14 [&_svg]:size-7',
    lg: 'size-16 [&_svg]:size-8',
    xl: 'size-20 [&_svg]:size-10',
  }[size];
  const content = icon ? <AnimatedIcon icon={icon} anim={anim} trigger={trigger} weight={weight} /> : children;
  const surface = gold ? GOLD_SURFACE : 'tile ring-1 ring-edge';

  if (shape === 'hex') {
    return (
      <span className={cn('relative grid shrink-0 place-items-center', sizeCls, className)}>
        <span aria-hidden className={cn('shape-hex absolute inset-0', gold ? 'bg-gold-500' : 'bg-[linear-gradient(160deg,var(--accent),var(--edge-strong)_60%,var(--color-gold-400))] opacity-60')} />
        <span aria-hidden className={cn('shape-hex absolute inset-[1.5px]', gold ? GOLD_SURFACE : 'bg-[linear-gradient(160deg,var(--accent-soft),var(--card-solid)_75%)]')} />
        <span className={cn('relative', gold ? 'text-midnight' : 'text-accent')}>{content}</span>
      </span>
    );
  }
  if (shape === 'diamond') {
    return (
      <span className={cn('relative grid shrink-0 place-items-center', sizeCls, className)}>
        <span aria-hidden className={cn('absolute inset-[13%] rotate-45 rounded-[30%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[135deg]', surface)} />
        <span className={cn('relative', gold ? 'text-midnight' : 'text-accent')}>{content}</span>
      </span>
    );
  }
  if (shape === 'circle') {
    return (
      <span className={cn('relative grid shrink-0 place-items-center rounded-full', sizeCls, surface, className)}>
        <span aria-hidden className="pointer-events-none absolute -inset-[5px] rounded-full border border-dashed border-accent/30 animate-spin-slower" />
        {content}
      </span>
    );
  }
  if (shape === 'blob') {
    return (
      <span
        className={cn(
          'shape-blob relative grid shrink-0 place-items-center',
          sizeCls,
          gold ? GOLD_SURFACE : 'bg-[linear-gradient(145deg,var(--accent-soft),var(--gold-soft))] text-accent ring-1 ring-edge',
          className,
        )}
      >
        {content}
      </span>
    );
  }
  return <span className={cn('relative grid shrink-0 place-items-center rounded-2xl', sizeCls, size === 'sm' && 'rounded-xl', surface, className)}>{content}</span>;
}
