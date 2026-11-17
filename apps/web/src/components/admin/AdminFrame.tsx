'use client';

import { ListIcon, TrayIcon, XIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@sabano/ui';

/**
 * Admin shell. Desktop: sticky sidebar beside the content.
 * Phones/tablets: a compact top bar; the same sidebar slides in as a drawer,
 * so the 12-item menu no longer sits above every page's content.
 */
export function AdminFrame({ brand, sidebar, newCount, children }: { brand: React.ReactNode; sidebar: React.ReactNode; newCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[17rem_1fr]">
      {/* Mobile top bar */}
      <div className="scheme-dark sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-edge bg-night px-3 text-fg shadow-[0_10px_30px_-18px_rgb(0_0_0/0.8)] sm:px-5 lg:hidden">
        {brand}
        <div className="ms-auto flex items-center gap-1.5">
          {newCount > 0 && (
            <Link href="/admin/submissions" className="flex h-10 items-center gap-1.5 rounded-full bg-gold-400 px-3 text-xs font-black text-navy-950">
              <TrayIcon weight="fill" className="size-4" aria-hidden />
              {newCount.toLocaleString('fa-IR')} جدید
            </Link>
          )}
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-tint"
            aria-label="باز کردن منوی پنل"
            aria-expanded={open}
            aria-controls="admin-sidebar"
            onClick={() => setOpen(true)}
          >
            <ListIcon weight="bold" className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn('fixed inset-0 z-40 bg-midnight/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />

      <aside
        id="admin-sidebar"
        aria-label="منوی پنل"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false);
        }}
        className={cn(
          'scheme-dark fixed inset-y-0 start-0 z-50 w-[min(18rem,86vw)] overflow-y-auto overscroll-contain bg-night text-fg shadow-[0_0_60px_rgb(0_0_0/0.5)] transition-[transform,visibility] duration-300 ease-[var(--ease-out-expo)]',
          'lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : 'max-lg:invisible max-lg:translate-x-full',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute end-4 top-5 z-10 grid size-10 place-items-center rounded-full bg-tint lg:hidden"
          aria-label="بستن منوی پنل"
        >
          <XIcon weight="bold" className="size-4.5" aria-hidden />
        </button>
        {sidebar}
      </aside>

      <main className="min-w-0 p-4 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
