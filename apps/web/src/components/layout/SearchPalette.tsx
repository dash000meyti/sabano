'use client';

import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  QuestionIcon,
  type Icon,
} from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { cn } from '@sabano/ui';
import { useRouter } from '@/i18n/navigation';

export type SearchHit = { type: 'page' | 'service' | 'post' | 'faq'; title: string; snippet: string; href: string };

const typeIcons: Record<SearchHit['type'], Icon> = {
  page: FileTextIcon,
  service: BriefcaseIcon,
  post: NewspaperIcon,
  faq: QuestionIcon,
};

/* A tiny shared open/close store so the header button and the dialog stay in sync. */
let isOpen = false;
const subs = new Set<() => void>();
function setOpen(v: boolean) {
  isOpen = v;
  subs.forEach((s) => s());
}
function useOpen() {
  return useSyncExternalStore(
    (cb) => (subs.add(cb), () => subs.delete(cb)),
    () => isOpen,
    () => false,
  );
}

export function SearchButton({ label, tone }: { label: string; tone: 'light' | 'dark' }) {
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={label}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors',
        tone === 'dark' ? 'text-fg hover:bg-tint' : 'text-fg/90 hover:bg-tint',
      )}
    >
      <MagnifyingGlassIcon weight="bold" className="size-5" aria-hidden />
      <kbd
        className={cn(
          'hidden rounded-md border px-1.5 py-0.5 font-sans text-[0.7rem] font-bold xl:inline',
          tone === 'dark' ? 'border-edge-strong text-fg-muted' : 'border-edge-strong text-fg-muted',
        )}
        dir="ltr"
      >
        ⌘K
      </kbd>
    </button>
  );
}

export function SearchPalette() {
  const t = useTranslations('search');
  const locale = useLocale();
  const router = useRouter();
  const open = useOpen();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const listId = useId();

  // Keyboard shortcuts: ⌘K / Ctrl+K and "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = /input|textarea|select/i.test(target.tagName) || target.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?locale=${locale}&q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { hits: SearchHit[] };
        setHits(data.hits);
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, locale]);

  // Short queries show the hint instead of stale results.
  const visibleHits = q.trim().length < 2 ? [] : hits;

  const go = useCallback(
    (hit: SearchHit) => {
      setOpen(false);
      router.push(hit.href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, visibleHits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = visibleHits[active];
      if (hit) go(hit);
      else if (q.trim()) {
        setOpen(false);
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      onClick={(e) => e.target === dialogRef.current && setOpen(false)}
      className="m-0 mx-auto mt-[12vh] w-[min(680px,calc(100vw-2rem))] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-midnight/70 backdrop:backdrop-blur-md"
      aria-label={t('title')}
    >
      <div className="border-glow glass-strong overflow-hidden rounded-[1.75rem] text-fg shadow-[0_50px_140px_-40px_rgb(0_0_0/0.9)]">
        <div className="relative z-[1] flex items-center gap-3 border-b border-edge px-6">
          <MagnifyingGlassIcon weight="bold" className="size-5 shrink-0 text-accent" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('placeholder')}
            className="h-[4.25rem] w-full bg-transparent text-lg text-fg outline-none placeholder:text-fg/35"
            role="combobox"
            aria-expanded={visibleHits.length > 0}
            aria-controls={listId}
            aria-activedescendant={visibleHits[active] ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          {loading && <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-aqua-400 border-t-transparent" />}
          <kbd className="hidden rounded-md border border-edge px-1.5 py-0.5 text-[0.7rem] font-bold text-fg-subtle sm:inline">Esc</kbd>
        </div>
        <ul id={listId} role="listbox" className="relative z-[1] max-h-[55vh] overflow-y-auto p-2" data-lenis-prevent>
          {q.trim().length < 2 ? (
            <li className="px-4 py-10 text-center text-sm text-fg-subtle">{t('hint')}</li>
          ) : visibleHits.length === 0 && !loading ? (
            <li className="px-4 py-10 text-center text-sm text-fg-subtle">{t('noResults')}</li>
          ) : (
            visibleHits.map((hit, i) => {
              const Icon = typeIcons[hit.type];
              return (
                <li key={hit.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(hit)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-2xl p-3 text-start transition-colors',
                      i === active ? 'bg-card-hover' : 'hover:bg-card-hover',
                    )}
                  >
                    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent ring-1 ring-edge">
                      <Icon weight="duotone" className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-fg">{hit.title}</span>
                        <span className="shrink-0 rounded-full bg-tint px-2 py-0.5 text-xs font-semibold text-fg-muted">
                          {t(`types.${hit.type}`)}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[0.82rem] leading-6 text-fg-subtle">{hit.snippet}</span>
                    </span>
                    <ArrowUpRightIcon className="mt-1 size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" aria-hidden />
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="relative z-[1] flex items-center gap-4 border-t border-edge bg-card px-6 py-3 text-[0.72rem] text-fg-subtle">
          <span>
            <kbd className="font-sans font-bold">↑↓</kbd> {t('keys.navigate')}
          </span>
          <span>
            <kbd className="font-sans font-bold">↵</kbd> {t('keys.select')}
          </span>
          <span>
            <kbd className="font-sans font-bold">Esc</kbd> {t('keys.close')}
          </span>
        </div>
      </div>
    </dialog>
  );
}
