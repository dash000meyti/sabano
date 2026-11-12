import { cn } from '@sabano/ui';
import { ArrowLeftIcon } from '../icons';

/** A "forward" arrow that points left in RTL and right in LTR. */
export function ForwardArrow({ className }: { className?: string }) {
  return <ArrowLeftIcon weight="bold" aria-hidden className={cn('size-4 ltr:-scale-x-100 transition-transform group-hover/btn:-translate-x-0.5 ltr:group-hover/btn:translate-x-0.5', className)} />;
}
