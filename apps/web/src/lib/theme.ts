export const THEME_KEY = 'sabano-theme';
export const THEME_COLORS = { light: '#ffffff', dark: '#020a18' } as const;

/**
 * Runs in <head> before first paint. The site is light by default (whatever the
 * OS prefers); it only turns dark when the visitor picked dark with the toggle.
 * Also marks JS as on.
 */
export const themeScript = `(function(){var d=document.documentElement;try{d.classList.toggle('dark',localStorage.getItem('${THEME_KEY}')==='dark');}catch(e){}d.classList.add('js');})();`;

/** The visitor's saved choice; light when nothing is saved or storage is blocked. */
export function prefersDark(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark';
  } catch {
    return false;
  }
}

/** Keeps the browser UI colour (address bar on phones) in step with the theme. */
export function syncThemeColor(dark: boolean) {
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light));
}
