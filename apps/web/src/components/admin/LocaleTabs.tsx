'use client';

import { useState } from 'react';
import { locales, localeMeta, type Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';

/**
 * Tabs for per-language fields. All panels stay in the DOM (hidden) so every
 * language is submitted with the form.
 */
export function LocaleTabs({ filled, panels }: { filled: Partial<Record<Locale, boolean>>; panels: Record<Locale, React.ReactNode> }) {
  const [active, setActive] = useState<Locale>('fa');
  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-1.5 border-b border-edge pb-3">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={active === l}
            onClick={() => setActive(l)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors',
              active === l ? 'bg-fg text-canvas' : 'text-fg/80 hover:bg-tint',
            )}
          >
            {localeMeta[l].name}
            <span className={cn('size-2 rounded-full', filled[l] ? 'bg-teal-400' : 'bg-gold-400')} title={filled[l] ? 'ترجمه دارد' : 'ترجمه ندارد'} />
          </button>
        ))}
      </div>
      {locales.map((l) => (
        <div key={l} role="tabpanel" hidden={active !== l} dir={localeMeta[l].dir} lang={localeMeta[l].hreflang} className="pt-5">
          {panels[l]}
        </div>
      ))}
    </div>
  );
}
