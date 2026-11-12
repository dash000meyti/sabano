'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@sabano/ui';
import { Link } from '@/i18n/navigation';

type Company = { id: number; slug: string; sector: string; logo: string | null; name: string; summary: string };

export function PortfolioGrid({
  companies,
  sectors,
  allLabel,
}: {
  companies: Company[];
  sectors: { key: string; label: string }[];
  allLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const present = sectors.filter((s) => companies.some((c) => c.sector === s.key));
  const shown = active ? companies.filter((c) => c.sector === active) : companies;
  return (
    <div>
      {present.length > 1 && (
        <div role="tablist" className="flex flex-wrap gap-2">
          {[{ key: null as string | null, label: allLabel }, ...present].map((s) => (
            <button
              key={s.key ?? 'all'}
              type="button"
              role="tab"
              aria-selected={active === s.key}
              onClick={() => setActive(s.key)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                active === s.key ? 'bg-navy-900 text-white' : 'border border-line bg-white text-navy-800 hover:border-navy-900/30',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <li key={c.id}>
            <Link
              href={`/portfolio/${c.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid h-20 place-items-center rounded-2xl bg-surface">
                {c.logo ? (
                  <Image src={c.logo} alt="" width={140} height={64} className="max-h-14 w-auto object-contain" />
                ) : (
                  <span className="text-gradient-teal text-3xl font-black">{c.name.slice(0, 1)}</span>
                )}
              </span>
              <span className="mt-5 text-xs font-bold text-teal-700">{sectors.find((s) => s.key === c.sector)?.label}</span>
              <span className="mt-1 text-lg font-extrabold text-navy-900">{c.name}</span>
              <span className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{c.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
