'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(pointer: fine)').matches;

/**
 * One tiny runtime for every interactive flourish on the site:
 *  - smooth scrolling (Lenis) on desktop
 *  - [data-reveal] / [data-words] scroll reveals
 *  - [data-count] number counters
 *  - .spotlight / .spotlight cursor glow (--mx/--my)
 *  - [data-magnetic] buttons and [data-tilt] cards
 * Everything degrades to static content without JS or with reduced motion.
 */
export function Effects() {
  const pathname = usePathname();

  // Smooth scrolling — once per session
  useEffect(() => {
    if (reduced() || !finePointer()) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -96 } });
    document.documentElement.classList.add('lenis');
    let id = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  // Pointer-driven effects — once per session (event delegation)
  useEffect(() => {
    if (!finePointer()) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const target = e.target as Element | null;
      const spot = target?.closest?.<HTMLElement>('.spotlight, .spotlight, [data-spotlight]');
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      if (reduced()) return;
      const m = target?.closest?.<HTMLElement>('[data-magnetic]') ?? null;
      if (magnet && magnet !== m) magnet.style.transform = '';
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        m.style.transform = `translate3d(${dx * 10}px, ${dy * 8}px, 0)`;
      }
      const t = target?.closest?.<HTMLElement>('[data-tilt]') ?? null;
      if (tilt && tilt !== t) {
        tilt.style.setProperty('--rx', '0deg');
        tilt.style.setProperty('--ry', '0deg');
      }
      tilt = t;
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        t.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`);
        t.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`);
      }
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (magnet) magnet.style.transform = '';
      if (tilt) {
        tilt.style.setProperty('--rx', '0deg');
        tilt.style.setProperty('--ry', '0deg');
      }
      magnet = tilt = null;
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Reveals and counters — re-scan on every route change
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-visible="true"]), [data-words]:not([data-visible="true"]), [data-count]:not([data-counted])'));
    const show = (el: HTMLElement) => {
      el.dataset.visible = 'true';
      if (el.dataset.count !== undefined && !el.dataset.counted) countUp(el);
    };
    if (!('IntersectionObserver' in window) || reduced()) {
      els.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}

/** Animates the digits inside an element from 0 to their final value, keeping the script (fa/en digits). */
function countUp(el: HTMLElement) {
  el.dataset.counted = 'true';
  const final = el.textContent ?? '';
  const fa = /[۰-۹]/.test(final);
  const ascii = final.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const target = Number.parseFloat(ascii.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(target) || target === 0) return;
  const prefix = ascii.slice(0, ascii.search(/\d/));
  const suffix = ascii.slice(ascii.search(/\d[\d.,]*(?!.*\d)/) + (ascii.match(/[\d.,]+(?!.*\d)/)?.[0].length ?? 0));
  const hasComma = /\d,\d/.test(ascii);
  const toScript = (s: string) => (fa ? s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!) : s);
  const start = performance.now();
  const duration = 1800;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 4);
    const v = Math.round(target * eased);
    const num = hasComma ? v.toLocaleString('en-US') : String(v);
    el.textContent = p < 1 ? toScript(`${prefix}${num}${suffix}`) : final;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
