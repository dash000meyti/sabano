import { cn } from '@sabano/ui';

/**
 * Soft drifting colour fields (pure CSS radial gradients — no blur filters, cheap to paint).
 * Colours come from theme tokens, so the same component reads as a deep glow on dark
 * surfaces and a pastel wash on light ones. Place inside a `relative isolate overflow-hidden` parent.
 */
export function Aurora({ className, intensity = 1, variant = 'default' }: { className?: string; intensity?: number; variant?: 'default' | 'gold' | 'cool' }) {
  const a = variant === 'gold' ? 'var(--aurora-gold)' : 'var(--aurora-a)';
  const b = variant === 'cool' ? 'var(--aurora-cool)' : 'var(--aurora-b)';
  const c = 'var(--aurora-c)';
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)} style={{ opacity: Math.min(1, intensity) }}>
      <div className="animate-drift absolute -start-[15%] -top-[25%] h-[85%] w-[70%] rounded-full" style={{ background: `radial-gradient(closest-side, ${a}, transparent)` }} />
      <div className="animate-drift-rev absolute -end-[10%] top-[10%] h-[80%] w-[60%] rounded-full" style={{ background: `radial-gradient(closest-side, ${b}, transparent)` }} />
      <div className="animate-drift absolute bottom-[-35%] start-[25%] h-[75%] w-[55%] rounded-full [animation-delay:-8s]" style={{ background: `radial-gradient(closest-side, ${c}, transparent)` }} />
    </div>
  );
}

/** Glossy 3D-looking spheres (CSS only). */
export function Orb({ className, tone = 'aqua', size = 120 }: { className?: string; tone?: 'aqua' | 'gold' | 'navy'; size?: number }) {
  const bg =
    tone === 'gold'
      ? 'radial-gradient(circle at 32% 28%, #fff7dd 0%, #f6d48f 18%, #eab543 42%, #a8771a 78%, #5a3d0e 100%)'
      : tone === 'navy'
        ? 'radial-gradient(circle at 32% 28%, #9ec0e6 0%, #2b5385 30%, #0a2748 70%, #020a18 100%)'
        : 'radial-gradient(circle at 32% 28%, #e7fffb 0%, #6ff5e6 18%, #12c8b8 45%, #036e6f 80%, #022c2e 100%)';
  const glow = tone === 'gold' ? 'rgb(234 181 67 / 0.45)' : tone === 'navy' ? 'rgb(43 83 133 / 0.5)' : 'rgb(47 227 210 / 0.45)';
  return (
    <span
      aria-hidden
      className={cn('pointer-events-none absolute block rounded-full', className)}
      style={{ width: size, height: size, background: bg, boxShadow: `0 ${size / 4}px ${size / 1.4}px -${size / 6}px ${glow}, inset -${size / 12}px -${size / 10}px ${size / 5}px rgb(0 0 0 / 0.35)` }}
    />
  );
}

/** Concentric orbit rings with travelling dots. */
export function Orbits({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" aria-hidden className={cn('pointer-events-none', className)} fill="none">
      <defs>
        <linearGradient id="orb-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12c8b8" stopOpacity=".6" />
          <stop offset=".5" stopColor="currentColor" stopOpacity=".08" />
          <stop offset="1" stopColor="#eab543" stopOpacity=".55" />
        </linearGradient>
      </defs>
      {[290, 230, 170, 110].map((r, i) => (
        <g key={r} className={i % 2 ? 'animate-spin-slower' : 'animate-spin-slow'} style={{ transformOrigin: '300px 300px' }}>
          <circle cx="300" cy="300" r={r} stroke="url(#orb-ring)" strokeWidth="1" strokeDasharray={i === 0 ? '2 10' : undefined} />
          <circle cx={300 + r} cy="300" r={i === 1 ? 5 : 3.5} fill={i % 2 ? '#eab543' : '#12c8b8'} />
        </g>
      ))}
    </svg>
  );
}
