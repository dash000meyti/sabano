'use client';

import { useLayoutEffect } from 'react';
import { THEME_KEY } from '@/lib/theme';

/**
 * The head script sets `.dark`/`.js` on <html> before first paint. If React ever
 * has to client-render the document from scratch (not-found and error recovery),
 * it resets <html> and those classes are lost; this puts them back before paint.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    const d = document.documentElement;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      // storage blocked: fall back to the system preference
    }
    d.classList.toggle('dark', stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    d.classList.add('js');
  }, []);
  return null;
}
