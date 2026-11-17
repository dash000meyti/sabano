'use client';

import { useLayoutEffect } from 'react';
import { prefersDark, syncThemeColor } from '@/lib/theme';

/**
 * The head script sets `.dark`/`.js` on <html> before first paint. If React ever
 * has to client-render the document from scratch (not-found and error recovery),
 * it resets <html> and those classes are lost; this puts them back before paint.
 * It also points the browser's theme colour at dark for visitors who chose dark.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    const d = document.documentElement;
    const dark = prefersDark();
    d.classList.toggle('dark', dark);
    d.classList.add('js');
    syncThemeColor(dark);
  }, []);
  return null;
}
