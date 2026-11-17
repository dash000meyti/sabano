import { getTranslations } from 'next-intl/server';
import type { Locale } from '@sabano/i18n';
import { cn } from '@sabano/ui';
import { BuildingsIcon, CoinsIcon, GlobeHemisphereEastIcon, MapPinIcon, SealCheckIcon, SparkleIcon, StrategyIcon } from '../icons';
import { AnimatedIcon } from '../ui/AnimatedIcon';

const items = [
  { k: 'type', icon: SealCheckIcon, anim: 'beat' },
  { k: 'focus', icon: GlobeHemisphereEastIcon, anim: 'spin' },
  { k: 'services', icon: StrategyIcon, anim: 'tilt' },
  { k: 'horizon', icon: CoinsIcon, anim: 'flip' },
  { k: 'shareholder', icon: BuildingsIcon, anim: 'grow' },
  { k: 'location', icon: MapPinIcon, anim: 'drop' },
] as const;

/** "Sabano at a glance" — short, quotable facts (definition list) for readers and answer engines. */
export async function FactsGrid({ locale, tone = 'light', className }: { locale: Locale; tone?: 'light' | 'dark'; className?: string }) {
  const t = await getTranslations({ locale, namespace: 'facts' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const dark = tone === 'dark';
  return (
    <div className={cn('relative overflow-hidden rounded-[2rem] p-7 sm:p-10', dark ? 'glass text-fg' : 'border border-edge bg-card shadow-card', className)} data-reveal>
      <div className="flex items-center gap-3">
        <AnimatedIcon icon={SparkleIcon} anim="twinkle" weight="fill" className="text-gold-400" iconClassName="size-5" />
        <h2 className="text-base font-black text-fg">{tc('atAGlance')}</h2>
        <span className="hairline flex-1" />
      </div>
      <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ k, icon: Icon, anim }) => (
          <div key={k} className="relative min-h-12 ps-16">
            <dt className={cn('text-xs font-semibold', dark ? 'text-fg-subtle' : 'text-fg-muted')}>
              <span className="absolute start-0 top-0 grid size-12 place-items-center rounded-full bg-accent-soft text-accent ring-1 ring-accent/20">
                <AnimatedIcon icon={Icon} anim={anim} iconClassName="size-6" />
              </span>
              {t(`${k}.label`)}
            </dt>
            <dd className={cn('mt-1 text-[0.98rem] font-bold leading-7', dark ? 'text-fg' : 'text-fg')}>{t(`${k}.value`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
