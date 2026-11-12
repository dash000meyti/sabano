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
                cat === c.key ? 'bg-navy-900 text-white' : 'border border-line bg-white text-navy-800 hover:border-navy-900/30',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="relative block md:w-80">
          <span className="sr-only">{t('searchPlaceholder')}</span>
          <MagnifyingGlassIcon weight="bold" className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-subtle" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-12 w-full rounded-full border border-line bg-white ps-11 pe-4 text-[0.95rem] text-navy-900 outline-none transition-colors placeholder:text-subtle focus:border-teal-500"
          />
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-line p-10 text-center text-muted">{t('noResults')}</p>
      ) : (
        <div className="mt-8 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
          {shown.map((f, i) => (
            <details key={f.id} id={`faq-${f.id}`} className="group/faq scroll-mt-28" open={i === 0 && !q}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 transition-colors hover:bg-surface/70">
                <h2 className="text-[1rem] font-bold leading-8 text-navy-900">{f.question}</h2>
                <span
                  aria-hidden
                  className="relative grid size-8 shrink-0 place-items-center rounded-full border border-line text-teal-700 transition-all group-open/faq:rotate-45 group-open/faq:border-teal-500 group-open/faq:bg-teal-500 group-open/faq:text-white"
                >
                  <span className="absolute h-0.5 w-3 rounded bg-current" />
                  <span className="absolute h-3 w-0.5 rounded bg-current" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-[0.98rem] leading-8 text-muted">{f.answer}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
