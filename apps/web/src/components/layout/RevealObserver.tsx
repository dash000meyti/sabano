'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

/** Adds data-visible to [data-reveal] elements as they scroll into view. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-visible="true"])'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => (el.dataset.visible = 'true'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = 'true';
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
