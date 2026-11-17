'use client';

import { CheckIcon, GlobeHemisphereEastIcon } from '@phosphor-icons/react';
import { useLocale } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { locales, localeMeta, type Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { Link, usePathname } from '@/i18n/navigation';
import { useAlternates } from './alternates-store';

export function LanguageSwitcher({ label, tone }: { label: string; tone: 'light' | 'dark' }) {
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const { locales: available, fallbackPath } = useAlternates();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`${localeMeta[current].short} — ${label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-colors',
          tone === 'dark' ? 'text-fg hover:bg-tint' : 'text-fg/90 hover:bg-tint',
        )}
      >
        <GlobeHemisphereEastIcon weight="duotone" className="size-5" aria-hidden />
        <span>{localeMeta[current].short}</span>
      </button>
      <ul
        id={id}
        role="listbox"
        aria-label={label}
        className={cn(
          'glass-strong absolute end-0 top-full z-50 mt-3 w-52 origin-top rounded-2xl p-1.5 shadow-[0_30px_70px_-24px_rgb(0_0_0/0.8)] transition-all duration-300',
          open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
        )}
      >
        {locales.map((l) => {
          const target = available && !available.includes(l) && fallbackPath ? fallbackPath : pathname;
          return (
            <li key={l} role="option" aria-selected={l === current}>
              <Link
                href={target}
                locale={l}
                lang={localeMeta[l].hreflang}
                hrefLang={localeMeta[l].hreflang}
                dir={localeMeta[l].dir}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-fg/80 hover:bg-card-hover hover:text-fg',
                  l === current && 'bg-card-hover text-accent',
                )}
              >
                <span>{localeMeta[l].name}</span>
                {l === current ? (
                  <CheckIcon weight="bold" className="size-4" aria-hidden />
                ) : (
                  <span className="text-xs text-fg/35">{localeMeta[l].short}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Inline language pills (mobile menu): same targets as the dropdown, no popup to clip. */
export function LanguageList({ label, className }: { label: string; className?: string }) {
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const { locales: available, fallbackPath } = useAlternates();
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-2">
        {locales.map((l) => {
          const target = available && !available.includes(l) && fallbackPath ? fallbackPath : pathname;
          const active = l === current;
          return (
            <li key={l}>
              <Link
                href={target}
                locale={l}
                lang={localeMeta[l].hreflang}
                hrefLang={localeMeta[l].hreflang}
                dir={localeMeta[l].dir}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'inline-flex h-10 items-center rounded-full px-4 text-sm font-bold transition-colors',
                  active ? 'bg-fg text-canvas' : 'border border-edge bg-tint text-fg/85 hover:border-edge-strong',
                )}
              >
                {localeMeta[l].name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
