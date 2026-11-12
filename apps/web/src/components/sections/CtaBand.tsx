import { buttonClasses, containerClasses } from '@sabano/ui';
import { Link } from '@/i18n/navigation';
import { DataLines, SignalRows } from '../decor/DataLines';
import { ForwardArrow } from '../ui/ArrowIcon';

export function CtaBand({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative py-16 sm:py-20">
      <div className={containerClasses}>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-navy-mesh px-6 py-14 text-white shadow-[0_40px_90px_-40px_rgb(6_33_64/0.7)] sm:px-12 lg:px-16" data-reveal>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-50" />
          <div className="pointer-events-none absolute -end-24 -top-24 -z-10 size-80 rounded-full bg-teal-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 start-1/3 -z-10 size-80 rounded-full bg-gold-400/15 blur-3xl" />
          <DataLines className="absolute -bottom-10 end-0 -z-10 hidden w-[46%] opacity-60 md:block rtl:-scale-x-100" />
          <SignalRows className="absolute end-6 top-6 -z-10 w-28 opacity-25" />
          <div className="max-w-2xl">
            <h2 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-extrabold">{title}</h2>
            <p className="mt-4 text-[1.02rem] leading-8 text-white/75">{text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primary.href} className={buttonClasses('gold', 'lg')}>
                {primary.label}
                <ForwardArrow />
              </Link>
              {secondary && (
                <Link href={secondary.href} className={buttonClasses('outline-light', 'lg')}>
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
