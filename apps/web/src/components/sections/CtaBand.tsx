import { buttonClasses, containerClasses } from '@sabano/ui';
import { Link } from '@/i18n/navigation';
import { Aurora, Orb, Orbits } from '../decor/Aurora';
import { RocketLaunchIcon } from '../icons';
import type { IconAnim, IconComponent } from '../ui/AnimatedIcon';
import { ForwardArrow } from '../ui/ArrowIcon';
import { IconTile } from '../ui/Section';
import { Words } from '../ui/Words';

export function CtaBand({
  title,
  text,
  primary,
  secondary,
  icon = RocketLaunchIcon,
  anim = 'rise',
}: {
  /** Animated badge above the heading */
  icon?: IconComponent;
  anim?: IconAnim;
  title: string;
  text: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative bg-canvas py-20 sm:py-28">
      <div className={containerClasses}>
        <div className="scheme-dark grain border-glow relative isolate overflow-hidden rounded-[2rem] bg-night px-5 py-14 text-center sm:rounded-[2.5rem] text-fg shadow-[0_50px_120px_-50px_rgb(2_10_24/0.9)] sm:px-14 sm:py-24" data-reveal="scale">
          <Aurora intensity={1.1} />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial" />
          <Orbits className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[56rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-30" />
          <Orb tone="aqua" size={90} className="start-[6%] top-[14%] hidden animate-float md:block" />
          <Orb tone="gold" size={56} className="bottom-[16%] end-[8%] hidden animate-float-slow md:block" />
          <div className="relative z-[2] mx-auto max-w-3xl">
            <div className="mb-8 flex justify-center" data-reveal>
              <IconTile icon={icon} anim={anim} trigger="always" tone="gold" size="xl" shape="blob" />
            </div>
            <h2 className="text-[clamp(2rem,1.2rem+3.4vw,4.2rem)] font-black leading-[1.15]">
              <Words text={title} wordClassName={(_, i, n) => (i >= n - 2 ? 'text-gold' : 'text-sheen')} />
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-9 text-fg-muted" data-reveal>
              {text}
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center" data-reveal>
              <Link href={primary.href} data-magnetic className={buttonClasses('gold', 'xl')}>
                {primary.label}
                <ForwardArrow className="size-5" />
              </Link>
              {secondary && (
                <Link href={secondary.href} data-magnetic className={buttonClasses('outline-light', 'xl')}>
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
