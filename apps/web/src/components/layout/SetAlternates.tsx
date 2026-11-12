'use client';

import { useEffect } from 'react';
import type { Locale } from '@sabano/i18n';
import { setAlternates } from './alternates-store';

export function SetAlternates({ locales, fallbackPath }: { locales: Locale[]; fallbackPath: string }) {
  useEffect(() => {
    setAlternates({ locales, fallbackPath });
    return () => setAlternates({ locales: null, fallbackPath: null });
  }, [locales, fallbackPath]);
  return null;
}
