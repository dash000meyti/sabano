'use client';

import { themeScript } from '@/lib/theme';

/**
 * The no-flash theme script, rendered into the server HTML only.
 *
 * It only ever runs while the browser parses the first HTML response. When React
 * builds <head> itself in the browser (language switch, client-rendered 404s) a
 * client-created <script> never executes and React 19 warns about it, so on the
 * client we render nothing: hydration skips the extra tag in <head>, and
 * <ThemeSync /> re-applies the theme after those client renders.
 */
export function ThemeScript() {
  if (typeof window !== 'undefined') return null;
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
