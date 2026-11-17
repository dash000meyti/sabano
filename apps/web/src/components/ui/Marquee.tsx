import { cn } from '@sabano/ui';

/** Infinite CSS marquee. Children are rendered twice for a seamless loop. */
export function Marquee({ children, className, reverse, speed = 50 }: { children: React.ReactNode; className?: string; reverse?: boolean; speed?: number }) {
  return (
    <div className={cn('group/mq relative flex overflow-hidden mask-fade-x', className)} dir="ltr">
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          inert={k === 1}
          className="animate-marquee flex shrink-0 items-center group-hover/mq:[animation-play-state:paused]"
          style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
