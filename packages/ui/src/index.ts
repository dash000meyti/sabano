import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant = 'gold' | 'primary' | 'outline' | 'outline-light' | 'ghost' | 'ghost-light' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300 ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60 select-none';

const variants: Record<ButtonVariant, string> = {
  gold: 'bg-gradient-to-b from-gold-300 to-gold-400 text-navy-950 shadow-[0_10px_30px_-10px_rgb(234_181_67/0.65)] hover:from-gold-200 hover:to-gold-300 hover:shadow-[0_14px_36px_-10px_rgb(234_181_67/0.8)] active:translate-y-px',
  primary:
    'bg-navy-900 text-white shadow-[0_10px_30px_-12px_rgb(6_33_64/0.6)] hover:bg-navy-800 active:translate-y-px',
  outline: 'border border-navy-900/15 bg-white text-navy-900 hover:border-navy-900/30 hover:bg-navy-50',
  'outline-light': 'border border-white/25 bg-white/5 text-white backdrop-blur-sm hover:border-white/45 hover:bg-white/10',
  ghost: 'text-navy-900 hover:bg-navy-50',
  'ghost-light': 'text-white/85 hover:bg-white/10 hover:text-white',
  glass: 'border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white/15',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[0.95rem]',
  lg: 'h-13 px-7 text-base',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export const containerClasses = 'mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8';
