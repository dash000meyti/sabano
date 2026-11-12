'use client';

import { CheckIcon, CopyIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function CopyButton({ value }: { value: string }) {
  const t = useTranslations('contact');
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-50"
    >
      {done ? <CheckIcon weight="bold" className="size-4" aria-hidden /> : <CopyIcon className="size-4" aria-hidden />}
      {done ? t('copied') : t('copy')}
    </button>
  );
}
