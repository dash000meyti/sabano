import 'server-only';
import { revalidatePath } from 'next/cache';
import { locales } from '@sabano/i18n';
import { pingIndexNow } from './indexnow';
import { invalidateSearchIndex } from './search';
import { pageUrl } from './site';

/**
 * Purges the cached public site after a content change. The site is small, so
 * invalidating the whole [locale] tree keeps things simple and always correct.
 */
export function revalidateSite(changedPaths: string[] = []) {
  revalidatePath('/', 'layout');
  invalidateSearchIndex();
  if (changedPaths.length) {
    void pingIndexNow(changedPaths.flatMap((p) => locales.map((l) => pageUrl(l, p))));
  }
}
