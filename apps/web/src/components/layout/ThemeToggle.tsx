'use client';

import { MoonStarsIcon, SunIcon } from '@phosphor-icons/react';
import { cn } from '@sabano/ui';
import { syncThemeColor, THEME_KEY } from '@/lib/theme';

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.classList.toggle('dark', dark);
  syncThemeColor(dark);
  window.dispatchEvent(new CustomEvent('sabano:theme', { detail: { dark } }));
  // Re-enable transitions after the swap so colours change instantly, not in a smear.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
}

/**
 * Light/dark switch. Icons swap with CSS (no hydration mismatch); the initial
 * theme is set by the inline head script. Light is the default; the choice made
 * here is saved and used on every later visit.
 */
export function ThemeToggle({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const dark = !document.documentElement.classList.contains('dark');
        apply(dark);
        try {
          localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
        } catch {
          /* private mode */
        }
      }}
      className={cn('relative grid size-11 place-items-center overflow-hidden rounded-full text-fg transition-colors hover:bg-tint', className)}
    >
      <SunIcon weight="duotone" aria-hidden className="size-5 text-gold-500 transition-all duration-500 dark:-translate-y-8 dark:rotate-90 dark:opacity-0" />
      <MoonStarsIcon weight="duotone" aria-hidden className="absolute size-5 translate-y-8 -rotate-90 text-accent opacity-0 transition-all duration-500 dark:translate-y-0 dark:rotate-0 dark:opacity-100" />
    </button>
  );
}
