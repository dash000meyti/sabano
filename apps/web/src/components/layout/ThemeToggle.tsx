'use client';

import { MoonStarsIcon, SunIcon } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { cn } from '@sabano/ui';
import { THEME_COLORS, THEME_KEY } from '@/lib/theme';

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  root.classList.toggle('dark', dark);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light));
  window.dispatchEvent(new CustomEvent('sabano:theme', { detail: { dark } }));
  // Re-enable transitions after the swap so colours change instantly, not in a smear.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
}

/**
 * Light/dark switch. Icons swap with CSS (no hydration mismatch); the initial
 * theme is set by the inline head script. Follows the OS until the user chooses.
 */
export function ThemeToggle({ label, className }: { label: string; className?: string }) {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (!localStorage.getItem(THEME_KEY)) apply(e.matches);
      } catch {
        apply(e.matches);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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
