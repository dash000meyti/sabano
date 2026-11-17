'use client';

import {
  ArrowUpRightIcon,
  BrainIcon,
  BriefcaseIcon,
  BuildingsIcon,
  CaretDownIcon,
  ChartLineUpIcon,
  ChatsCircleIcon,
  CloudArrowUpIcon,
  CoinsIcon,
  CompassIcon,
  CreditCardIcon,
  HandshakeIcon,
  NewspaperIcon,
  PhoneIcon,
  QuestionIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
  VaultIcon,
  XIcon,
  type Icon,
} from '@phosphor-icons/react';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { buttonClasses, cn } from '@sabano/ui';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '../brand/Logo';
import { LanguageList, LanguageSwitcher } from './LanguageSwitcher';
import type { HeaderLabels, NavGroup, NavIconName } from './nav-types';
import { SearchButton } from './SearchPalette';
import { ThemeToggle } from './ThemeToggle';

const icons: Record<NavIconName, Icon> = {
  shield: ShieldCheckIcon,
  credit: CreditCardIcon,
  chart: ChartLineUpIcon,
  vault: VaultIcon,
  chats: ChatsCircleIcon,
  brain: BrainIcon,
  coins: CoinsIcon,
  cloud: CloudArrowUpIcon,
  rocket: RocketLaunchIcon,
  compass: CompassIcon,
  briefcase: BriefcaseIcon,
  buildings: BuildingsIcon,
  users: UsersThreeIcon,
  news: NewspaperIcon,
  question: QuestionIcon,
  handshake: HandshakeIcon,
  phone: PhoneIcon,
};

function NavIcon({ name, className }: { name?: NavIconName; className?: string }) {
  if (!name) return null;
  const C = icons[name];
  return <C weight="duotone" className={className} aria-hidden />;
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderClient({ groups, labels }: { groups: NavGroup[]; labels: HeaderLabels }) {
  // Russian nav labels are long: its bar CTA waits for 2xl so the bar never overflows
  const ctaFrom = useLocale() === 'ru' ? '2xl:inline-flex' : 'xl:inline-flex';
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const drawerId = useId();

  // Close menus on navigation (adjust state during render instead of in an effect)
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(null);
    setMobileOpen(false);
    setHidden(false);
  }

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 180);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? 'hidden' : '';
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (mobileOpen) lenis?.stop();
    else lenis?.start();
  }, [mobileOpen]);

  const enter = useCallback((key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  }, []);
  const leave = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 180);
  }, []);

  const showBar = !hidden || open !== null || mobileOpen;

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-500 ease-[var(--ease-out-expo)] sm:px-5 sm:pt-4', !showBar && '-translate-y-[130%]')}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-6 focus:top-6 focus:z-[60] focus:rounded-full focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-midnight"
      >
        {labels.skip}
      </a>
      <div
        className={cn(
          'mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 rounded-full pe-2 ps-3 text-fg transition-[background-color,box-shadow,border-color] duration-500',
          scrolled || open
            ? 'glass-strong shadow-[0_18px_50px_-20px_rgb(0_0_0/0.65)]'
            : 'border border-edge bg-card backdrop-blur-md',
        )}
      >
        <Link href="/" className="shrink-0 rounded-full">
          <Logo name={labels.brandName} sub={labels.brandSub} tone="light" priority compact />
        </Link>

        <nav ref={navRef} aria-label={labels.menu} className="mx-auto hidden items-center lg:flex">
          <ul className="flex items-center gap-0.5">
            {groups.map((g) => {
              const active = (g.href && isActive(pathname, g.href)) || g.items?.some((i) => isActive(pathname, i.href));
              const linkCls = cn(
                'relative inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.9rem] font-semibold xl:px-4 text-fg-muted transition-colors hover:bg-card-hover hover:text-fg',
                (active || open === g.key) && 'text-fg',
              );
              const dot = active && <span aria-hidden className="absolute -bottom-0.5 start-1/2 size-1 -translate-x-1/2 rounded-full bg-aqua-400 shadow-[0_0_10px_2px_rgb(47_227_210/0.7)] rtl:translate-x-1/2" />;
              if (!g.items) {
                return (
                  <li key={g.key}>
                    <Link href={g.href!} className={linkCls} aria-current={active ? 'page' : undefined}>
                      {g.label}
                      {dot}
                    </Link>
                  </li>
                );
              }
              const isOpen = open === g.key;
              return (
                <li key={g.key} className={g.mega ? undefined : 'relative'} onMouseEnter={() => enter(g.key)} onMouseLeave={leave}>
                  <button type="button" className={linkCls} aria-expanded={isOpen} aria-controls={`menu-${g.key}`} onClick={() => setOpen(isOpen ? null : g.key)}>
                    {g.label}
                    <CaretDownIcon weight="bold" className={cn('size-3 opacity-60 transition-transform duration-300', isOpen && 'rotate-180')} aria-hidden />
                    {dot}
                  </button>
                  <div
                    id={`menu-${g.key}`}
                    className={cn(
                      'absolute top-full z-50 pt-4 transition-all duration-400 ease-[var(--ease-out-expo)]',
                      g.mega ? 'start-1/2 -translate-x-1/2 rtl:translate-x-1/2' : 'start-0',
                      isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
                    )}
                  >
                    <div
                      className={cn(
                        'glass-strong overflow-hidden rounded-[1.75rem] p-2 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.8)]',
                        g.mega ? 'grid w-[min(900px,94vw)] grid-cols-[1.7fr_1fr] gap-2' : 'w-84',
                      )}
                    >
                      <ul className={cn(g.mega && 'grid grid-cols-2 gap-1 p-1')}>
                        {g.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                'group/item spotlight flex items-start gap-3.5 overflow-hidden rounded-2xl p-3.5 transition-colors hover:bg-card-hover',
                                isActive(pathname, item.href) && 'bg-card-hover',
                              )}
                            >
                              {item.icon && (
                                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(145deg,rgb(47_227_210/0.2),rgb(255_255_255/0.03))] text-accent ring-1 ring-edge transition-transform duration-500 group-hover/item:scale-110">
                                  <NavIcon name={item.icon} className="size-5.5" />
                                </span>
                              )}
                              <span className="relative z-[1] min-w-0">
                                <span className="block text-sm font-bold text-fg">{item.label}</span>
                                {item.desc && <span className="mt-1 block text-[0.78rem] leading-6 text-fg-subtle">{item.desc}</span>}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {g.featured && (
                        <Link href={g.featured.href} className="group/feat scheme-dark border-glow relative flex flex-col justify-end overflow-hidden rounded-[1.4rem] bg-[radial-gradient(120%_90%_at_100%_0%,rgb(0_170_169/0.45),transparent_55%),radial-gradient(90%_80%_at_0%_100%,rgb(234_181_67/0.3),transparent_60%),#04122a] p-6">
                          <span aria-hidden className="absolute inset-0 bg-dots opacity-40" />
                          <span className="relative text-xl font-black leading-8">{g.featured.title}</span>
                          <span className="relative mt-2 text-sm leading-7 text-fg-muted">{g.featured.text}</span>
                          <span className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold text-midnight transition-transform group-hover/feat:-translate-y-0.5">
                            {g.featured.cta}
                            <ArrowUpRightIcon weight="bold" className="size-4 rtl:-scale-x-100" aria-hidden />
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          <SearchButton label={labels.search} tone="light" />
          {/* On phones these two live in the menu, so the bar never overflows */}
          <ThemeToggle label={labels.theme} className="max-sm:hidden" />
          <div className="max-sm:hidden">
            <LanguageSwitcher label={labels.language} tone="light" />
          </div>
          <Link href="/cooperation" data-magnetic className={buttonClasses('gold', 'sm', cn('ms-1 hidden h-11 px-5 md:inline-flex lg:hidden', ctaFrom))}>
            {labels.cta}
          </Link>
          <button
            type="button"
            className="relative grid size-11 place-items-center rounded-full bg-tint lg:hidden"
            aria-label={labels.openMenu}
            aria-expanded={mobileOpen}
            aria-controls={drawerId}
            onClick={() => setMobileOpen(true)}
          >
            <span aria-hidden className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 w-full rounded bg-card" />
              <span className="h-0.5 w-3/4 rounded bg-accent" />
            </span>
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu */}
      <div
        id={drawerId}
        role="dialog"
        aria-modal="true"
        aria-label={labels.menu}
        inert={!mobileOpen}
        className={cn(
          'grain fixed inset-0 z-[70] flex flex-col overflow-hidden bg-hero text-fg transition-[opacity,clip-path] duration-700 ease-[var(--ease-out-expo)] lg:hidden',
          mobileOpen ? 'opacity-100 [clip-path:circle(150%_at_90%_5%)]' : 'pointer-events-none opacity-0 [clip-path:circle(0%_at_90%_5%)] rtl:[clip-path:circle(0%_at_10%_5%)]',
        )}
      >
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_80%_0%,rgb(0_170_169/0.35),transparent),radial-gradient(60%_40%_at_0%_100%,rgb(234_181_67/0.18),transparent)]" />
        <div className="flex h-[5.5rem] shrink-0 items-center justify-between px-6">
          <Logo name={labels.brandName} sub={labels.brandSub} tone="light" compact />
          <button type="button" className="grid size-11 place-items-center rounded-full bg-tint" aria-label={labels.closeMenu} onClick={() => setMobileOpen(false)}>
            <XIcon weight="bold" className="size-5" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 pb-8" aria-label={labels.menu} data-lenis-prevent>
          <ul className="space-y-1">
            {groups.map((g, gi) => (
              <li
                key={g.key}
                className={cn('transition-all duration-700 ease-[var(--ease-out-expo)]', mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0')}
                style={{ transitionDelay: mobileOpen ? `${120 + gi * 60}ms` : '0ms' }}
              >
                {g.items ? (
                  <details className="group/d border-b border-edge">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-2xl font-black">
                      {g.label}
                      <CaretDownIcon weight="bold" className="size-5 text-accent transition-transform group-open/d:rotate-180" aria-hidden />
                    </summary>
                    <ul className="grid gap-1 pb-4">
                      {g.items.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 text-base text-fg/80 active:bg-tint">
                            <NavIcon name={item.icon} className="size-5 text-accent" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link href={g.href!} className="block border-b border-edge py-4 text-2xl font-black">
                    {g.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="shrink-0 space-y-4 border-t border-edge px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
          <LanguageList label={labels.language} />
          <div className="flex items-center gap-3">
            <ThemeToggle label={labels.theme} className="shrink-0 bg-tint" />
            <Link href="/cooperation" className={buttonClasses('gold', 'lg', 'min-w-0 flex-1')}>
              {labels.cta}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
