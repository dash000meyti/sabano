import Image from 'next/image';
import type { Locale } from '@sabano/i18n';
import { cn, containerClasses } from '@sabano/ui';
import { DataLines, SignalRows } from '../decor/DataLines';
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs';
import { Kicker } from '../ui/Section';

type Props = {
  locale: Locale;
  crumbs: Crumb[];
  kicker: string;
  title: React.ReactNode;
  /** Answer-first summary paragraph (40–60 words) — the main AEO/GEO target */
  lead?: React.ReactNode;
  image?: { src: string; alt: string };
  children?: React.ReactNode;
  aside?: React.ReactNode;
  compact?: boolean;
};

export function PageHero({ locale, crumbs, kicker, title, lead, image, children, aside, compact }: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-mesh text-white">
      {image && (
        // Decorative backdrop: desktop only, so on phones the heading stays the LCP element.
        <div className="absolute inset-0 -z-10 hidden md:block">
          <Image src={image.src} alt="" fill loading="lazy" sizes="100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-l from-navy-950/30 via-navy-950/80 to-navy-950 rtl:bg-gradient-to-r" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-line-grid [mask-image:radial-gradient(70%_80%_at_70%_30%,#000,transparent)]" />
      <DataLines className="absolute -bottom-8 end-[-6%] -z-10 hidden w-[52%] max-w-[760px] opacity-70 md:block rtl:-scale-x-100" />
      <SignalRows className="absolute start-[-40px] top-1/2 -z-10 hidden w-40 -translate-y-1/2 opacity-30 xl:block rtl:-scale-x-100" />
      <div className="hairline-gold absolute inset-x-0 bottom-0" />
      <div className={cn(containerClasses, 'relative pt-36 sm:pt-40', compact ? 'pb-14 sm:pb-16' : 'pb-16 sm:pb-24')}>
        <Breadcrumbs locale={locale} items={crumbs} />
        <div className={cn('mt-8 grid gap-10', aside && 'lg:grid-cols-[1.4fr_1fr] lg:items-end')}>
          <div className="max-w-3xl">
            <Kicker tone="light">{kicker}</Kicker>
            <h1 className="mt-4 text-[clamp(2rem,1.3rem+2.8vw,3.5rem)] font-extrabold text-white">{title}</h1>
            {lead && <p className="mt-6 max-w-2xl text-[1.06rem] leading-8 text-white/78 sm:text-lg sm:leading-9">{lead}</p>}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
