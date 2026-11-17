'use client';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { cn } from '@sabano/ui';

type Faq = { id: number; category: string; question: string; answer: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, ' ');

/** Category tabs + instant search over FAQs. All answers are server-rendered first. */
export function FaqExplorer({ faqs, categories }: { faqs: Faq[]; categories: { key: string; label: string }[] }) {
  const t = useTranslations('faq');
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const nq = norm(q.trim());
    return faqs.filter((f) => (!cat || f.category === cat) && (!nq || norm(`${f.question} ${f.answer}`).includes(nq)));
  }, [faqs, cat, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label={t('hero.kicker')} className="flex flex-wrap gap-2">
          {[{ key: null as string | null, label: t('categories.all') }, ...categories].map((c) => (
            <button
              key={c.key ?? 'all'}
              type="button"
              role="tab"
              aria-selected={cat === c.key}
              onClick={() => setCat(c.key)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                cat === c.key ? 'bg-fg text-canvas shadow-[0_10px_24px_-12px_rgb(6_33_64/0.6)]' : 'border border-edge bg-card text-fg hover:border-edge-strong',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="relative block md:w-80">
          <span className="sr-only">{t('searchPlaceholder')}</span>
          <MagnifyingGlassIcon weight="bold" className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-13 w-full rounded-full border border-edge bg-card ps-11 pe-4 text-[0.95rem] text-fg shadow-card outline-none transition-all placeholder:text-fg-subtle focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          />
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-edge p-10 text-center text-fg-muted">{t('noResults')}</p>
      ) : (
        <div className="mt-10 space-y-3">
          {shown.map((f, i) => (
            <details
              key={f.id}
              id={`faq-${f.id}`}
              className="group/faq scroll-mt-28 overflow-hidden rounded-[1.5rem] border border-edge bg-card transition-all duration-500 open:border-accent/40 open:shadow-lift"
              open={i === 0 && !q}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:gap-6 sm:px-7 sm:py-5">
                <h2 className="text-[0.98rem] font-bold leading-8 sm:text-[1.02rem] text-fg">{f.question}</h2>
                <span
                  aria-hidden
                  className="relative grid size-9 shrink-0 place-items-center rounded-full bg-canvas-alt text-accent transition-all duration-500 group-open/faq:rotate-[135deg] group-open/faq:bg-fg group-open/faq:text-canvas"
                >
                  <span className="absolute h-0.5 w-3.5 rounded bg-current" />
                  <span className="absolute h-3.5 w-0.5 rounded bg-current" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-[0.98rem] leading-8 text-fg-muted sm:px-7">{f.answer}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
