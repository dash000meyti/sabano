import type { Locale } from '@sabano/i18n';

export type LocaleParams = { params: Promise<{ locale: string }> };
export type LocaleSlugParams = { params: Promise<{ locale: string; slug: string }> };

/** The [locale] layout validates the segment, so pages can trust it. */
export async function readLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  return (await params).locale as Locale;
}
