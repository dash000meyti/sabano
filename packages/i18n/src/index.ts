export const locales = ['fa', 'en', 'zh', 'ru', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fa';

export type LocaleMeta = {
  /** Native name shown in the language switcher */
  name: string;
  /** Short code shown in compact UI */
  short: string;
  dir: 'rtl' | 'ltr';
  /** BCP-47 tag used for <html lang> and hreflang */
  hreflang: string;
  /** Open Graph locale */
  og: string;
  /** Locale passed to Intl formatters */
  intl: string;
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  fa: { name: 'فارسی', short: 'FA', dir: 'rtl', hreflang: 'fa-IR', og: 'fa_IR', intl: 'fa-IR' },
  en: { name: 'English', short: 'EN', dir: 'ltr', hreflang: 'en', og: 'en_US', intl: 'en-US' },
  zh: { name: '简体中文', short: '中文', dir: 'ltr', hreflang: 'zh-Hans', og: 'zh_CN', intl: 'zh-CN' },
  ru: { name: 'Русский', short: 'RU', dir: 'ltr', hreflang: 'ru', og: 'ru_RU', intl: 'ru-RU' },
  es: { name: 'Español', short: 'ES', dir: 'ltr', hreflang: 'es', og: 'es_ES', intl: 'es-ES' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Path prefix for a locale: fa lives at the root, others under /xx */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`;
}

/** Build a public path for a locale, e.g. localizedPath('en', '/about') -> '/en/about' */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  const out = `${localePrefix(locale)}${clean}`;
  return out === '' ? '/' : out;
}
