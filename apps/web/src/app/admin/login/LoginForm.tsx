'use client';

import { useActionState } from 'react';
import { buttonClasses } from '@sabano/ui';
import { login, type LoginState } from './actions';

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ''} />
      <div>
        <label htmlFor="email" className="text-sm font-bold text-navy-900">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="username"
          required
          defaultValue={state.email}
          className="mt-2 block h-12 w-full rounded-xl border border-line bg-white px-4 text-start text-navy-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-bold text-navy-900">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          className="mt-2 block h-12 w-full rounded-xl border border-line bg-white px-4 text-start text-navy-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClasses('primary', 'lg', 'w-full')}>
        {pending ? 'در حال ورود…' : 'ورود به پنل'}
      </button>
    </form>
  );
}
