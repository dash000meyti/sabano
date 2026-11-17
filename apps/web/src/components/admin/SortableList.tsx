'use client';

import { CaretDownIcon, CaretUpIcon, DotsSixVerticalIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { cn } from '@sabano/ui';
import { reorderEntityAction } from '@/app/admin/(panel)/content/actions';

export type SortableItem = { id: number; title: string; subtitle?: string | null; image?: string | null; badges: { label: string; tone: 'teal' | 'gold' | 'gray' }[]; href: string };

/** Drag-and-drop ordering (native HTML5 DnD) with an explicit "save order" step. */
export function SortableList({ entity, items: initial }: { entity: string; items: SortableItem[] }) {
  const [items, setItems] = useState(initial);
  const [drag, setDrag] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  const move = (from: number, to: number) => {
    if (from === to) return;
    setItems((list) => {
      const next = [...list];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it!);
      return next;
    });
    setDirty(true);
  };

  return (
    <div>
      <ul className="divide-y divide-edge overflow-hidden rounded-2xl border border-edge bg-card shadow-card">
        {items.map((it, i) => (
          <li
            key={it.id}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag !== null && drag !== i) {
                move(drag, i);
                setDrag(i);
              }
            }}
            onDragEnd={() => setDrag(null)}
            className={cn('flex items-center gap-2.5 px-3 py-2.5 transition-colors sm:gap-4 sm:px-4 sm:py-3', drag === i ? 'bg-accent-soft' : 'hover:bg-canvas-alt/60')}
          >
            <span className="hidden cursor-grab text-fg-subtle active:cursor-grabbing sm:inline" aria-hidden>
              <DotsSixVerticalIcon weight="bold" className="size-5" />
            </span>
            <span className="flex flex-col" role="group" aria-label="جابه‌جایی">
              <button type="button" aria-label="بالاتر" disabled={i === 0} onClick={() => move(i, i - 1)} className="grid h-6 w-8 place-items-center rounded-md text-fg-subtle hover:bg-tint hover:text-fg disabled:opacity-20">
                <CaretUpIcon weight="bold" className="size-3.5" aria-hidden />
              </button>
              <button type="button" aria-label="پایین‌تر" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="grid h-6 w-8 place-items-center rounded-md text-fg-subtle hover:bg-tint hover:text-fg disabled:opacity-20">
                <CaretDownIcon weight="bold" className="size-3.5" aria-hidden />
              </button>
            </span>
            {it.image !== undefined && (
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-edge bg-canvas-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.image && <img src={it.image} alt="" className="size-full object-contain" />}
              </span>
            )}
            <Link href={it.href} className="min-w-0 flex-1 py-1.5">
              <span className="block truncate text-sm font-bold text-fg">{it.title}</span>
              {it.subtitle && <span className="block truncate text-xs text-fg-muted">{it.subtitle}</span>}
            </Link>
            <span className="hidden flex-wrap justify-end gap-1.5 sm:flex">
              {it.badges.map((b) => (
                <span
                  key={b.label}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-bold',
                    b.tone === 'teal' && 'bg-accent-soft text-accent',
                    b.tone === 'gold' && 'bg-gold-soft text-gold-ink ring-1 ring-gold-edge',
                    b.tone === 'gray' && 'bg-tint text-fg/80',
                  )}
                >
                  {b.label}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      {dirty && (
        <div className="sticky bottom-4 mt-4 flex items-center justify-between gap-4 scheme-dark rounded-2xl bg-navy-900 p-4 text-fg shadow-lift">
          <span className="text-sm">ترتیب تغییر کرده است.</span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await reorderEntityAction(entity, items.map((x) => x.id));
                setDirty(false);
              })
            }
            className="rounded-full bg-gold-400 px-5 py-2 text-sm font-bold text-navy-950"
          >
            {pending ? 'در حال ذخیره…' : 'ذخیرهٔ ترتیب'}
          </button>
        </div>
      )}
    </div>
  );
}
