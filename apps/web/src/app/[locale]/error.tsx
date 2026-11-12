'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { buttonClasses, containerClasses } from '@sabano/ui';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error');
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="bg-navy-mesh text-white">
      <div className={`${containerClasses} flex min-h-[70svh] flex-col justify-center py-40`}>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t('title')}</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">{t('text')}</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-white/40" dir="ltr">#{error.digest}</p>}
        <button type="button" onClick={reset} className={buttonClasses('gold', 'lg', 'mt-8 w-fit')}>
          {t('retry')}
        </button>
      </div>
    </section>
  );
}
