import { cn } from '@sabano/ui';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">{title}</h1>
        {description && <p className="mt-1.5 text-sm leading-7 text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className, actions }: { title?: string; description?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn('min-w-0 rounded-2xl border border-edge bg-card p-4 shadow-card sm:p-6', className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-extrabold text-fg">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-6 text-fg-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export const inputClass =
  'block w-full rounded-xl border border-edge bg-card px-3.5 py-2.5 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-canvas-alt';

export function Field({ label, hint, required, children, className, htmlFor }: { label: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.8rem] font-bold text-fg">
        {label}
        {required && <span className="ms-1 text-danger">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[0.75rem] leading-6 text-fg-muted">{hint}</p>}
    </div>
  );
}

const tones = {
  gray: 'bg-tint text-fg/80',
  teal: 'bg-accent-soft text-accent',
  gold: 'bg-gold-soft text-gold-ink ring-1 ring-gold-edge',
  red: 'bg-danger-soft text-danger',
  navy: 'bg-fg text-canvas',
};
export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', tones[tone])}>{children}</span>;
}

export function Flash({ message, tone = 'teal' }: { message?: string | null; tone?: 'teal' | 'red' }) {
  if (!message) return null;
  return (
    <p role="status" className={cn('mb-6 rounded-xl border p-3.5 text-sm font-semibold', tone === 'teal' ? 'border-accent/40 bg-accent-soft text-accent' : 'border-danger-edge bg-danger-soft text-danger')}>
      {message}
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-edge bg-card p-12 text-center text-sm text-fg-muted">{children}</div>;
}
