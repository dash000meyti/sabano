import { cn } from '@sabano/ui';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">{title}</h1>
        {description && <p className="mt-1.5 text-sm leading-7 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className, actions }: { title?: string; description?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn('rounded-2xl border border-line bg-white p-6 shadow-card', className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-extrabold text-navy-900">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-6 text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export const inputClass =
  'block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition placeholder:text-subtle focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-surface';

export function Field({ label, hint, required, children, className, htmlFor }: { label: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.8rem] font-bold text-navy-900">
        {label}
        {required && <span className="ms-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[0.75rem] leading-6 text-muted">{hint}</p>}
    </div>
  );
}

const tones = {
  gray: 'bg-navy-50 text-navy-700',
  teal: 'bg-teal-50 text-teal-700',
  gold: 'bg-gold-100 text-gold-700',
  red: 'bg-red-50 text-red-700',
  navy: 'bg-navy-900 text-white',
};
export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: keyof typeof tones }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold', tones[tone])}>{children}</span>;
}

export function Flash({ message, tone = 'teal' }: { message?: string | null; tone?: 'teal' | 'red' }) {
  if (!message) return null;
  return (
    <p role="status" className={cn('mb-6 rounded-xl border p-3.5 text-sm font-semibold', tone === 'teal' ? 'border-teal-200 bg-teal-50 text-teal-800' : 'border-red-200 bg-red-50 text-red-700')}>
      {message}
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-muted">{children}</div>;
}
