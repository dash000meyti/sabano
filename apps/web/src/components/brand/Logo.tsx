import Image from 'next/image';
import { cn } from '@sabano/ui';

type Props = {
  name: string;
  sub: string;
  tone?: 'light' | 'dark';
  className?: string;
  priority?: boolean;
};

/** Brand lock-up: mark + wordmark. Swap the mark for the official SVG when it arrives. */
export function Logo({ name, sub, tone = 'dark', className, priority }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'relative grid size-11 shrink-0 place-items-center rounded-2xl transition-colors',
          tone === 'light' ? 'bg-white shadow-[0_6px_20px_-8px_rgb(0_0_0/0.5)]' : 'bg-white ring-1 ring-navy-900/10',
        )}
      >
        <Image src="/images/brand/sabano-mark.png" alt="" width={34} height={24} priority={priority} style={{ width: 34, height: 'auto' }} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('text-[1.35rem] font-extrabold tracking-tight', tone === 'light' ? 'text-white' : 'text-navy-900')}>
          {name}
        </span>
        <span className={cn('mt-1 text-[0.7rem] font-medium', tone === 'light' ? 'text-white/65' : 'text-muted')}>{sub}</span>
      </span>
    </span>
  );
}
