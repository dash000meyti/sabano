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
          'inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-colors',
          tone === 'dark' ? 'text-navy-900 hover:bg-navy-50' : 'text-white/90 hover:bg-white/10',
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
          'absolute end-0 top-full z-50 mt-2 w-48 origin-top rounded-2xl border border-navy-900/5 bg-white p-1.5 shadow-[0_24px_60px_-24px_rgb(6_33_64/0.45)] transition-all duration-200',
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
                  'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-surface',
                  l === current && 'bg-teal-50/70 text-teal-800',
                )}
              >
                <span>{localeMeta[l].name}</span>
                {l === current ? (
                  <CheckIcon weight="bold" className="size-4" aria-hidden />
                ) : (
                  <span className="text-xs text-subtle">{localeMeta[l].short}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
