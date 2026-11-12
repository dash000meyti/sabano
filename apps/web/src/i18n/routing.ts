import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from '@sabano/i18n';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  // Never redirect by Accept-Language: crawlers must always get the URL they asked for.
  localeDetection: false,
  // hreflang links are emitted per page in metadata and in the sitemap.
  alternateLinks: false,
});
