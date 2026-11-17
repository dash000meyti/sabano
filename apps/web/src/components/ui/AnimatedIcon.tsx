import { cn } from '@sabano/ui';
import type { ShieldCheckIcon } from '../icons';

export type IconComponent = typeof ShieldCheckIcon;

/** Motion presets (CSS keyframes in globals.css) — pick the one that matches the icon's meaning. */
export type IconAnim =
  | 'float'
  | 'spin'
  | 'swing'
  | 'tilt'
  | 'beat'
  | 'rise'
  | 'flip'
  | 'pop'
  | 'drop'
  | 'ring'
  | 'seek'
  | 'twinkle'
  | 'grow'
  | 'wave'
  | 'glide'
  | 'nod';

export type AnimatedIconSpec = { icon: IconComponent; anim?: IconAnim };

/**
 * A Phosphor icon with a meaningful CSS motion. `trigger="hover"` keeps it still until
 * an ancestor `.group` is hovered or focused (cards); otherwise it moves gently all the time.
 * Decorative: always aria-hidden. Reduced-motion users get a still icon.
 */
export function AnimatedIcon({
  icon: Icon,
  anim = 'float',
  trigger = 'always',
  weight = 'duotone',
  className,
  iconClassName,
}: {
  icon: IconComponent;
  anim?: IconAnim;
  trigger?: 'always' | 'hover';
  weight?: 'duotone' | 'fill' | 'bold' | 'regular';
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span aria-hidden className={cn('ai', className)} data-anim={anim} data-trigger={trigger === 'hover' ? 'hover' : undefined}>
      <Icon weight={weight} className={iconClassName} />
    </span>
  );
}
