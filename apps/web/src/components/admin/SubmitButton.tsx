'use client';

import { useFormStatus } from 'react-dom';
import { buttonClasses, type ButtonVariant } from '@sabano/ui';

export function SubmitButton({ children, variant = 'primary', className, name, value, confirm }: { children: React.ReactNode; variant?: ButtonVariant; className?: string; name?: string; value?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={buttonClasses(variant, 'sm', className)}
    >
      {pending && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}
