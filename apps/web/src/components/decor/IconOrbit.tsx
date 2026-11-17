import { cn } from '@sabano/ui';
import { AnimatedIcon, type AnimatedIconSpec } from '../ui/AnimatedIcon';

const CHIP_SHAPES = ['rounded-2xl', 'rounded-full', 'rounded-[38%_62%_55%_45%/45%_40%_60%_55%]'];

/**
 * Icon constellation for page heroes: a glossy gold core with the page's main icon,
 * and themed icon chips riding two counter-rotating rings (they stay upright).
 * Pure CSS, decorative.
 */
export function IconOrbit({ center, items, className }: { center: AnimatedIconSpec; items: AnimatedIconSpec[]; className?: string }) {
  const outer = items.filter((_, i) => i % 2 === 0);
  const inner = items.filter((_, i) => i % 2 === 1);
  const rings = [
    { list: outer, radius: 43, duration: '90s', offset: -90 },
    { list: inner, radius: 26, duration: '60s', offset: -30 },
  ];
  return (
    <div aria-hidden className={cn('@container relative aspect-square', className)}>
      {/* Rings */}
      <div className="absolute inset-[7%] rounded-full bg-[radial-gradient(circle,transparent_55%,var(--accent-soft))]" />
      <div className="absolute inset-[7%] rounded-full border border-edge-strong opacity-60" />
      <div className="absolute inset-[3%] animate-spin-slower rounded-full border border-dashed border-accent/30" />
      <div className="absolute inset-[24%] rounded-full border border-edge-strong bg-[radial-gradient(circle,var(--accent-soft),transparent_72%)] opacity-80" />
      <div className="absolute inset-[34%] rounded-full bg-[radial-gradient(circle,rgb(234_181_67/0.35),transparent_70%)] blur-2xl" />

      {/* Core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative grid size-[24cqw] place-items-center rounded-[30%] bg-[linear-gradient(145deg,#f7dfa8,#eab543_55%,#c48a22)] text-midnight shadow-gold">
          <span className="absolute inset-[-16%] animate-spin-slow rounded-[34%] border border-gold-400/45" />
          <span className="absolute inset-[-30%] animate-spin-slower rounded-full border border-dashed border-gold-400/30" />
          <AnimatedIcon icon={center.icon} anim={center.anim} iconClassName="size-[12cqw]" />
        </span>
      </div>

      {/* Riders */}
      {rings.map(({ list, radius, duration, offset }, r) => (
        <div key={r} className="orbit-track absolute inset-0" style={{ '--orbit-duration': duration } as React.CSSProperties}>
          {list.map(({ icon, anim }, i) => {
            const angle = offset + (360 / list.length) * i;
            return (
              <div key={i} className="absolute left-1/2 top-1/2 size-0" style={{ transform: `rotate(${angle}deg) translate(${radius}cqw) rotate(${-angle}deg)` }}>
                <span
                  className={cn(
                    'glass absolute -start-[7.5cqw] -top-[7.5cqw] grid size-[15cqw] place-items-center text-accent shadow-card',
                    r === 1 && '-start-[6cqw] -top-[6cqw] size-[12cqw]',
                    CHIP_SHAPES[(i + r) % CHIP_SHAPES.length],
                  )}
                >
                  <AnimatedIcon icon={icon} anim={anim} iconClassName={r === 1 ? 'size-[5.5cqw]' : 'size-[7cqw]'} />
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
