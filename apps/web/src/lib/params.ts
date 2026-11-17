import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import type { Locale } from '@sabano/i18n';
import { routing } from '@/i18n/routing';

export type LocaleParams = { params: Promise<{ locale: string }> };
export type LocaleSlugParams = { params: Promise<{ locale: string; slug: string }> };

/** Narrows the [locale] segment, 404-ing on anything else (e.g. `/mockServiceWorker.js`). */
export function toLocale(value: string): Locale {
  if (!hasLocale(routing.locales, value)) notFound();
  return value as Locale;
}

/**
 * Pages and generateMetadata run in parallel with the [locale] layout, so they
 * can't rely on its check: validate here too.
 */
export async function readLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  return toLocale((await params).locale);
}
