export const THEME_KEY = 'sabano-theme';
export const THEME_COLORS = { light: '#ffffff', dark: '#020a18' } as const;

/**
 * Runs in <head> before first paint: applies the saved theme (or the system
 * preference) so there is never a flash of the wrong theme. Also marks JS as on.
 */
export const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('${THEME_KEY}');var k=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;d.classList.toggle('dark',k);}catch(e){}d.classList.add('js');})();`;
