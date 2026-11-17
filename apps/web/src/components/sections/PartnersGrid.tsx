import Image from 'next/image';
import type { PartnerView } from '@sabano/db';
import { cn } from '@sabano/ui';
import { Marquee } from '../ui/Marquee';
import { ArrowUpRightIcon } from '../icons';

function PartnerCard({ p, newTab, className }: { p: PartnerView; newTab: string; className?: string }) {
  return (
    <a
      href={p.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group spotlight relative flex flex-col items-center gap-4 overflow-hidden rounded-[1.75rem] border border-edge bg-card p-7 text-center shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift',
        className,
      )}
    >
      <ArrowUpRightIcon className="absolute end-4 top-4 size-4 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" aria-hidden />
      <span className="relative z-[1] grid h-20 w-full place-items-center">
        {p.logo && (
          <Image src={p.logo} alt="" width={160} height={100} className="h-20 w-auto max-w-full object-contain opacity-75 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0" />
        )}
      </span>
      <span className="relative z-[1] text-[0.88rem] font-bold leading-7 text-fg">{p.name}</span>
      <span className="sr-only">{newTab}</span>
    </a>
  );
}

export function PartnersGrid({ partners, newTab }: { partners: PartnerView[]; newTab: string }) {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {partners.map((p, i) => (
        <li key={p.id} data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
          <PartnerCard p={p} newTab={newTab} className="h-full" />
        </li>
      ))}
    </ul>
  );
}

/** Endless logo strip — repeated so short lists still fill wide screens. */
export function PartnersMarquee({ partners, newTab, className }: { partners: PartnerView[]; newTab: string; className?: string }) {
  const loop = partners.length < 6 ? [...partners, ...partners] : partners;
  return (
    <div className={className}>
      <Marquee speed={45}>
        {loop.map((p, i) => (
          <div key={`${p.id}-${i}`} className="w-72 shrink-0 px-2.5" dir="auto">
            <PartnerCard p={p} newTab={newTab} className="h-full" />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
