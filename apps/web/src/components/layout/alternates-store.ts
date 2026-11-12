'use client';

import { useSyncExternalStore } from 'react';
import type { Locale } from '@sabano/i18n';

/**
 * Pages that exist only in some locales (e.g. untranslated articles) publish their
 * available locales here so the language switcher can fall back to a parent page.
 */
type State = { locales: Locale[] | null; fallbackPath: string | null };
let state: State = { locales: null, fallbackPath: null };
const listeners = new Set<() => void>();

export function setAlternates(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

export function useAlternates(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
