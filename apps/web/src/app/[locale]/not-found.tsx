import { containerClasses } from '@sabano/ui';
import { Aurora, Orb, Orbits } from '@/components/decor/Aurora';
import { NotFoundContent } from '@/components/sections/NotFoundContent';

export default function NotFound() {
  return (
    <section className="grain relative isolate overflow-hidden bg-hero text-fg">
      <Aurora intensity={1.1} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-radial" />
      <Orbits className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[60rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-40" />
      <Orb tone="aqua" size={90} className="start-[12%] top-[24%] animate-float" />
      <Orb tone="gold" size={52} className="bottom-[20%] end-[14%] animate-float-slow" />
      <div className={`${containerClasses} relative z-[2] flex min-h-[88svh] flex-col items-center justify-center py-40 text-center`}>
        <NotFoundContent />
      </div>
    </section>
  );
}
