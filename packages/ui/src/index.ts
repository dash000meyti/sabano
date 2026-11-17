import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant =
  | 'gold'
  | 'primary'
  | 'light'
  | 'outline'
  | 'outline-light'
  | 'ghost'
  | 'ghost-light'
  | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/* Labels stay on one line from `sm` up; on narrow phones a long label (ru/es) wraps and the button grows instead of overflowing. */
const base =
  'group/btn relative isolate inline-flex max-w-full items-center justify-center gap-2.5 text-center leading-snug sm:whitespace-nowrap rounded-full font-bold transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60 select-none active:scale-[0.98]';

const outline =
  'border border-edge-strong bg-card text-fg backdrop-blur-md hover:border-accent/60 hover:bg-card-hover';
const contrast = 'bg-fg text-canvas shadow-[0_14px_34px_-14px_rgb(6_33_64/0.55)] hover:-translate-y-0.5 hover:opacity-90';

/* All variants read theme tokens (see theme.css), so they adapt to light/dark and to `.scheme-*` subtrees. */
const variants: Record<ButtonVariant, string> = {
  gold: 'btn-shine bg-[linear-gradient(135deg,#f7dfa8_0%,#eab543_45%,#d4972a_100%)] text-midnight shadow-gold hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-12px_rgb(234_181_67/0.85),inset_0_1px_0_rgb(255_255_255/0.6)]',
  primary: contrast,
  light: contrast,
  outline,
  'outline-light': outline,
  ghost: 'text-fg hover:bg-tint',
  'ghost-light': 'text-fg hover:bg-tint',
  glass: 'glass text-fg hover:bg-tint',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 py-1.5 text-[0.82rem]',
  md: 'min-h-11 px-6 py-2 text-[0.92rem]',
  lg: 'min-h-13 px-7 py-2.5 text-[0.98rem]',
  xl: 'min-h-15 px-9 py-3 text-[1.05rem]',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export const containerClasses = 'mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10';
