import Image from 'next/image';
import { cn } from '@sabano/ui';

type Props = {
  name: string;
  sub: string;
  /** Kept for API compatibility; colours now follow the theme tokens. */
  tone?: 'light' | 'dark';
  className?: string;
  priority?: boolean;
  compact?: boolean;
};

/** Brand lock-up: mark + wordmark. Swap the mark for the official SVG when it arrives. */
export function Logo({ name, sub, className, priority, compact }: Props) {
  const mark = compact ? 28 : 34;
  const markH = Math.round((mark * 495) / 640);
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'relative grid shrink-0 place-items-center rounded-full bg-white ring-1 ring-edge',
          compact ? 'size-10' : 'size-12',
          'shadow-[0_6px_18px_-8px_rgb(6_33_64/0.4)] dark:shadow-[0_0_0_4px_rgb(255_255_255/0.06),0_8px_24px_-6px_rgb(47_227_210/0.45)]',
        )}
      >
        {/* Fixed box on both sides (mark is 640×495): next/image never sees just one side "modified" */}
        <Image src="/images/brand/sabano-mark.png" alt="" width={mark} height={markH} priority={priority} style={{ width: mark, height: markH }} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('font-black tracking-tight text-fg', compact ? 'text-[1.15rem]' : 'text-[1.4rem]')}>{name}</span>
        <span className={cn('mt-1 text-[0.72rem] font-medium text-fg-subtle', compact && 'max-[25rem]:hidden')}>{sub}</span>
      </span>
    </span>
  );
}
