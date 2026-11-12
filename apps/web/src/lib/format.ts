import { localeMeta, type Locale } from '@sabano/i18n';

const faDigits = '۰۱۲۳۴۵۶۷۸۹';

/** Converts ASCII digits to Persian digits for the fa locale; leaves others as-is. */
export function localizeDigits(value: string | number, locale: Locale): string {
  const s = String(value);
  return locale === 'fa' ? s.replace(/[0-9]/g, (d) => faDigits[Number(d)]!) : s;
}

export function formatDate(date: Date, locale: Locale, style: 'long' | 'short' = 'long'): string {
  const tag = locale === 'fa' ? 'fa-IR-u-ca-persian-nu-arabext' : localeMeta[locale].intl;
  return new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'Asia/Tehran',
  }).format(date);
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : localeMeta[locale].intl).format(n);
}

/** '021-88517259' -> tel URI '+982188517259' */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return `tel:${digits}`;
  if (digits.startsWith('0')) return `tel:+98${digits.slice(1)}`;
  return `tel:${digits}`;
}

/** Display format: Persian digits locally, international format elsewhere. */
export function formatPhone(phone: string, locale: Locale): string {
  const digits = phone.replace(/\D/g, '');
  if (locale === 'fa') return localizeDigits(phone, 'fa');
  const national = digits.startsWith('0') ? digits.slice(1) : digits.replace(/^98/, '');
  const area = national.slice(0, 2);
  const rest = national.slice(2);
  return `+98 ${area} ${rest.slice(0, 4)} ${rest.slice(4)}`.trim();
}

export function intlPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+98${digits.startsWith('0') ? digits.slice(1) : digits}`;
}
