import { getTranslations } from 'next-intl/server';
import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { Link } from '@/i18n/navigation';
import { breadcrumbLd } from '@/lib/jsonld';
import { pageUrl } from '@/lib/site';
import { JsonLd } from '../seo/JsonLd';

export type Crumb = { label: string; href: string };

/** Visible breadcrumb trail + BreadcrumbList structured data. The last crumb is the current page. */
export async function Breadcrumbs({ locale, items, tone = 'light' }: { locale: Locale; items: Crumb[]; tone?: 'light' | 'dark' }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  const all: Crumb[] = [{ label: t('home'), href: '/' }, ...items];
  return (
    <>
      <nav aria-label={t('breadcrumb')}>
        <ol className={cn('inline-flex flex-wrap items-center gap-x-2 rounded-full px-4 py-1 text-[0.8rem]', tone === 'light' ? 'glass text-fg-subtle' : 'border border-edge bg-card text-fg-muted')}>
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className={tone === 'light' ? 'text-fg/90' : 'text-fg'}>
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className={cn('inline-block py-1.5 transition-colors', tone === 'light' ? 'hover:text-fg' : 'hover:text-fg')}>
                    {c.label}
                  </Link>
                )}
                {!last && <span aria-hidden className="text-xs opacity-60">{locale === 'fa' ? '‹' : '›'}</span>}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all.map((c) => ({ name: c.label, url: pageUrl(locale, c.href) })))} />
    </>
  );
}
