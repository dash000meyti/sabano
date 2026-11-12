import { getTranslations } from 'next-intl/server';
import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';

const keys = ['type', 'focus', 'services', 'horizon', 'shareholder', 'location'] as const;

/** "Sabano at a glance" — short, quotable facts (definition list) for readers and answer engines. */
export async function FactsGrid({ locale, tone = 'light', className }: { locale: Locale; tone?: 'light' | 'dark'; className?: string }) {
  const t = await getTranslations({ locale, namespace: 'facts' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  return (
    <div className={cn('rounded-3xl p-6 sm:p-8', tone === 'light' ? 'border border-line bg-white shadow-card' : 'glass-card text-white', className)}>
      <h2 className={cn('text-base font-extrabold', tone === 'light' ? 'text-navy-900' : 'text-white')}>{tc('atAGlance')}</h2>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {keys.map((k) => (
          <div key={k} className={cn('border-s-2 ps-4', tone === 'light' ? 'border-teal-500/40' : 'border-gold-400/50')}>
            <dt className={cn('text-xs font-semibold', tone === 'light' ? 'text-muted' : 'text-white/60')}>{t(`${k}.label`)}</dt>
            <dd className={cn('mt-1 text-[0.95rem] font-bold leading-7', tone === 'light' ? 'text-navy-900' : 'text-white')}>{t(`${k}.value`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
