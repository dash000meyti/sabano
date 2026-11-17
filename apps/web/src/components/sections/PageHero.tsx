import Image from 'next/image';
import type { Locale } from '@sabano/i18n';
import { cn, containerClasses } from '@sabano/ui';
import { Aurora, Orb, Orbits } from '../decor/Aurora';
import { IconOrbit } from '../decor/IconOrbit';
import type { AnimatedIconSpec, IconAnim, IconComponent } from '../ui/AnimatedIcon';
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs';
import { Kicker } from '../ui/Section';
import { Words } from '../ui/Words';

type Props = {
  locale: Locale;
  crumbs: Crumb[];
  kicker: string;
  /** Kicker icon + motion */
  icon?: IconComponent;
  anim?: IconAnim;
  /** Icon constellation shown beside the heading on large screens (pages without an image) */
  visual?: { center: AnimatedIconSpec; items: AnimatedIconSpec[] };
  title: React.ReactNode;
  /** Answer-first summary paragraph (40–60 words) — the main AEO/GEO target */
  lead?: React.ReactNode;
  image?: { src: string; alt: string };
  children?: React.ReactNode;
  aside?: React.ReactNode;
  compact?: boolean;
  /** Trailing words of a string title rendered in gold */
  highlight?: number;
};

export function PageHero({ locale, crumbs, kicker, icon, anim, visual, title, lead, image, children, aside, compact, highlight = 1 }: Props) {
  const words = typeof title === 'string' ? title.split(/\s+/).filter(Boolean).length : 0;
  const side = aside ?? (visual && !image ? <IconOrbit center={visual.center} items={visual.items} className="-my-10 hidden w-full max-w-[29rem] justify-self-center lg:block" /> : null);
  return (
    <section className="grain relative isolate overflow-hidden bg-hero text-fg">
      <Aurora intensity={0.95} />
      {image && (
        // Decorative backdrop: desktop only, so on phones the heading stays the LCP element.
        <div aria-hidden className="absolute inset-y-0 end-0 -z-10 hidden w-[58%] md:block">
          <Image src={image.src} alt="" fill loading="lazy" sizes="60vw" className="object-cover opacity-30 mix-blend-multiply grayscale dark:opacity-45 dark:mix-blend-luminosity dark:grayscale-0" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-canvas/70 to-canvas rtl:bg-gradient-to-r" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/60" />
        </div>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial" />
      {!image && !visual && (
        <>
          <Orbits className="pointer-events-none absolute -end-40 top-1/2 -z-10 hidden w-[44rem] -translate-y-1/2 opacity-45 md:block" />
          <Orb tone="aqua" size={84} className="end-[16%] top-[24%] -z-10 hidden animate-float md:block" />
          <Orb tone="gold" size={44} className="bottom-[22%] end-[30%] -z-10 hidden animate-float-slow md:block" />
        </>
      )}
      <div className="hairline absolute inset-x-0 bottom-0" />
      <div className={cn(containerClasses, 'relative z-[2] pt-36 sm:pt-44', compact ? 'pb-16 sm:pb-20' : 'pb-20 sm:pb-28')}>
        <div data-intro>
          <Breadcrumbs locale={locale} items={crumbs} />
        </div>
        <div className={cn('mt-10 grid gap-12', aside && 'lg:grid-cols-[1.35fr_1fr] lg:items-end', !aside && side && 'lg:grid-cols-[1.35fr_1fr] lg:items-center')}>
          <div className="max-w-4xl">
            <div data-intro style={{ '--reveal-delay': 80 } as React.CSSProperties}>
              <Kicker icon={icon} anim={anim}>
                {kicker}
              </Kicker>
            </div>
            <h1 className="mt-6 text-[clamp(2.3rem,1.3rem+3.8vw,4.8rem)] font-black leading-[1.12]">
              {typeof title === 'string' ? (
                <Words mode="intro" text={title} delay={150} wordClassName={(_, i) => (i >= words - highlight ? 'text-gold' : 'text-sheen')} />
              ) : (
                title
              )}
            </h1>
            {lead && (
              <p className="mt-7 max-w-2xl text-[1.06rem] leading-8 text-fg-muted sm:text-lg sm:leading-9" data-intro style={{ '--reveal-delay': 350 } as React.CSSProperties}>
                {lead}
              </p>
            )}
            {children}
          </div>
          {side}
        </div>
      </div>
    </section>
  );
}
