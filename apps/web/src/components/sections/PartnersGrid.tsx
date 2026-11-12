import Image from 'next/image';
import type { PartnerView } from '@sabano/db';
import { ArrowUpRightIcon } from '../icons';

export function PartnersGrid({ partners, newTab }: { partners: PartnerView[]; newTab: string }) {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {partners.map((p, i) => (
        <li key={p.id} data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
          <a
            href={p.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-full flex-col items-center gap-4 rounded-3xl border border-line bg-white p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lift"
          >
            <ArrowUpRightIcon className="absolute end-4 top-4 size-4 text-subtle opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" aria-hidden />
            <span className="relative grid h-24 w-full place-items-center">
              {p.logo && (
                <Image
                  src={p.logo}
                  alt=""
                  width={160}
                  height={96}
                  className="max-h-24 w-auto object-contain opacity-80 grayscale-[35%] transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                />
              )}
            </span>
            <span className="text-[0.88rem] font-bold leading-7 text-navy-900">{p.name}</span>
            <span className="sr-only">{newTab}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
