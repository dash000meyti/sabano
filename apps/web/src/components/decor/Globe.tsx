'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@sabano/ui';

type City = { name: string; loc: [number, number] };

const TEHRAN: [number, number] = [35.6892, 51.389];
const CITIES: City[] = [
  { name: 'Dubai', loc: [25.2048, 55.2708] },
  { name: 'Istanbul', loc: [41.0082, 28.9784] },
  { name: 'Moscow', loc: [55.7558, 37.6173] },
  { name: 'Shanghai', loc: [31.2304, 121.4737] },
  { name: 'Mumbai', loc: [19.076, 72.8777] },
  { name: 'Frankfurt', loc: [50.1109, 8.6821] },
  { name: 'Madrid', loc: [40.4168, -3.7038] },
  { name: 'Kuala Lumpur', loc: [3.139, 101.6869] },
];

/**
 * True when WebGL would run on the CPU (SwiftShader, llvmpipe, …). There the
 * globe's shader setup can block the main thread for seconds, so we show the
 * static sphere instead.
 */
function softwareWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl', { failIfMajorPerformanceCaveat: true });
    if (!gl) return true;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return true;
  }
}

/** Converts a lat/long into the globe angles that bring it to the front. */
const focus = ([lat, long]: [number, number]): [number, number] => [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];

/**
 * Interactive dotted globe (cobe, ~5 KB WebGL) centred on Tehran with arcs to
 * regional and global markets. Loaded after first paint; pauses off-screen.
 */
export function Globe({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let destroyed = false;
    let globe: { update: (s: Record<string, unknown>) => void; destroy: () => void } | null = null;
    let raf = 0;
    let visible = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [basePhi, baseTheta] = focus(TEHRAN);
    let dragX: number | null = null;
    let dragOffset = 0;
    let velocity = 0;
    let t = 0;
    let onTheme: (() => void) | null = null;

    const start = async () => {
      if (softwareWebGL()) {
        setFailed(true);
        return;
      }
      const { default: createGlobe } = await import('cobe');
      if (destroyed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = () => wrap.getBoundingClientRect().width;
      let width = size();
      const create = () => {
        const dark = document.documentElement.classList.contains('dark');
        globe = createGlobe(canvas, {
          devicePixelRatio: dpr,
          width: width * dpr,
          height: width * dpr,
          phi: basePhi,
          theta: baseTheta * 0.55,
          dark: dark ? 1 : 0,
          diffuse: dark ? 1.25 : 1.35,
          scale: 1,
          mapSamples: 20000,
          mapBrightness: dark ? 7 : 4.2,
          mapBaseBrightness: dark ? 0.02 : 0,
          baseColor: dark ? [0.11, 0.25, 0.42] : [0.93, 0.96, 0.99],
          markerColor: dark ? [0.92, 0.71, 0.26] : [0.83, 0.59, 0.16],
          glowColor: dark ? [0.05, 0.42, 0.48] : [0.84, 0.95, 0.96],
          arcColor: dark ? [0.18, 0.89, 0.82] : [0, 0.6, 0.6],
          arcWidth: 0.6,
          arcHeight: 0.28,
          markerElevation: 0.015,
          opacity: dark ? 0.95 : 1,
          markers: [
            { location: TEHRAN, size: 0.09 },
            ...CITIES.map((c) => ({ location: c.loc, size: 0.035, color: (dark ? [0.47, 0.96, 0.9] : [0, 0.6, 0.6]) as [number, number, number] })),
          ],
          arcs: CITIES.map((c) => ({ from: TEHRAN, to: c.loc })),
        }) as typeof globe;
      };
      try {
        create();
      } catch {
        setFailed(true);
        return;
      }
      setReady(true);
      onTheme = () => {
        globe?.destroy();
        try {
          create();
        } catch {
          setFailed(true);
        }
      };
      window.addEventListener('sabano:theme', onTheme);

      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible || !globe) return;
        const w = size();
        if (Math.abs(w - width) > 1) {
          width = w;
          globe.update({ width: w * dpr, height: w * dpr });
        }
        if (!reduced) t += 0.0045;
        if (dragX === null) {
          dragOffset += velocity;
          velocity *= 0.94;
          dragOffset *= 0.985; // ease back toward Tehran
        }
        globe.update({ phi: basePhi + Math.sin(t) * 0.55 + dragOffset, theta: baseTheta * 0.55 + Math.cos(t * 0.7) * 0.06 });
      };
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
    });
    io.observe(wrap);
    const onVis = () => {
      visible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVis);

    const down = (e: PointerEvent) => {
      dragX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (dragX === null) return;
      const delta = (e.clientX - dragX) / 220;
      dragX = e.clientX;
      dragOffset += delta;
      velocity = delta * 0.5;
    };
    const up = () => {
      dragX = null;
      canvas.style.cursor = 'grab';
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    // Defer WebGL work until the browser is idle so it never competes with LCP.
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const handle = idle ? idle(() => void start(), { timeout: 1200 }) : window.setTimeout(() => void start(), 300);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      const cancelIdle = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (idle && cancelIdle) cancelIdle(handle);
      else clearTimeout(handle);
      if (onTheme) window.removeEventListener('sabano:theme', onTheme);
      globe?.destroy();
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn('relative aspect-square', className)}>
      {/* Atmosphere glow behind the sphere */}
      <div aria-hidden className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgb(0_170_169/0.18),transparent_62%)] blur-2xl dark:bg-[radial-gradient(circle_at_50%_50%,rgb(0_170_169/0.28),transparent_62%)]" />
      {failed ? (
        <div aria-hidden className="absolute inset-[10%]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#e6eef7_55%,#c6d6e7)] shadow-[inset_-24px_-32px_70px_rgb(6_33_64/0.14),0_0_100px_rgb(0_170_169/0.18)] dark:bg-[radial-gradient(circle_at_35%_30%,#1a3f6d,#062140_55%,#020a18)] dark:shadow-[inset_-30px_-40px_80px_rgb(0_0_0/0.5),0_0_120px_rgb(0_170_169/0.25)]" />
          <div className="absolute inset-0 rounded-full bg-dots bg-[length:11px_11px] [mask-image:radial-gradient(circle_at_40%_36%,black_25%,transparent_70%)]" />
          <span className="absolute start-[58%] top-[34%] size-3 rounded-full bg-gold-400 shadow-[0_0_0_6px_rgb(234_181_67/0.2),0_0_24px_rgb(234_181_67/0.7)]" />
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn('relative size-full cursor-grab touch-pan-y transition-opacity duration-[1.6s] ease-out', ready ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  );
}
