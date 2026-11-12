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
  ListIcon,
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
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { buttonClasses, cn } from '@sabano/ui';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from '../brand/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { HeaderLabels, NavGroup, NavIconName } from './nav-types';
import { SearchButton } from './SearchPalette';

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
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const drawerId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation (adjust state during render instead of in an effect)
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

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
  }, [mobileOpen]);

  const enter = useCallback((key: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  }, []);
  const leave = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  }, []);

  const solid = scrolled || open !== null;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500',
        solid
          ? 'bg-white/90 shadow-[0_1px_0_rgb(6_33_64/0.06),0_10px_30px_-18px_rgb(6_33_64/0.35)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-navy-950/70 to-transparent',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-navy-950"
      >
        {labels.skip}
      </a>
      <div className="mx-auto flex h-[4.75rem] w-full max-w-[1320px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${labels.brandName} — ${labels.home}`} className="shrink-0 rounded-2xl">
          <Logo name={labels.brandName} sub={labels.brandSub} tone={solid ? 'dark' : 'light'} priority />
        </Link>

        <nav ref={navRef} aria-label={labels.menu} className="ms-4 hidden flex-1 items-center lg:flex">
          <ul className="flex items-center gap-0.5">
            {groups.map((g) => {
              const active = (g.href && isActive(pathname, g.href)) || g.items?.some((i) => isActive(pathname, i.href));
              const linkCls = cn(
                'relative inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[0.92rem] font-semibold transition-colors',
                solid ? 'text-navy-900 hover:bg-navy-50' : 'text-white/90 hover:bg-white/10 hover:text-white',
                active && (solid ? 'text-teal-700' : 'text-white'),
              );
              if (!g.items) {
                return (
                  <li key={g.key}>
                    <Link href={g.href!} className={linkCls} aria-current={active ? 'page' : undefined}>
                      {g.label}
                      {active && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-400" />}
                    </Link>
                  </li>
                );
              }
              const isOpen = open === g.key;
              return (
                <li key={g.key} className={g.mega ? undefined : 'relative'} onMouseEnter={() => enter(g.key)} onMouseLeave={leave}>
                  <button
                    type="button"
                    className={linkCls}
                    aria-expanded={isOpen}
                    aria-controls={`menu-${g.key}`}
                    onClick={() => setOpen(isOpen ? null : g.key)}
                  >
                    {g.label}
                    <CaretDownIcon
                      weight="bold"
                      className={cn('size-3.5 opacity-70 transition-transform duration-300', isOpen && 'rotate-180')}
                      aria-hidden
                    />
                    {active && <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-400" />}
                  </button>
                  <div
                    id={`menu-${g.key}`}
                    className={cn(
                      'absolute top-full z-50 transition-all duration-300 ease-[var(--ease-out-expo)]',
                      g.mega ? 'start-1/2 -translate-x-1/2 pt-1 rtl:translate-x-1/2' : 'start-0 pt-3',
                      isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
                    )}
                  >
                    <div
                      className={cn(
                        'overflow-hidden rounded-3xl border border-navy-900/5 bg-white p-2 shadow-[0_30px_80px_-30px_rgb(6_33_64/0.45)]',
                        g.mega ? 'grid w-[min(860px,92vw)] grid-cols-[1.6fr_1fr] gap-2' : 'w-80',
                      )}
                    >
                      <ul className={cn(g.mega && 'grid grid-cols-2 gap-1 p-1')}>
                        {g.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                'group/item flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-surface',
                                isActive(pathname, item.href) && 'bg-teal-50/60',
                              )}
                            >
                              {item.icon && (
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-navy-50 to-teal-50 text-teal-700 ring-1 ring-navy-900/5 transition-colors group-hover/item:from-teal-50 group-hover/item:to-gold-50">
                                  <NavIcon name={item.icon} className="size-5" />
                                </span>
                              )}
                              <span className="min-w-0">
                                <span className="block text-sm font-bold text-navy-900">{item.label}</span>
                                {item.desc && <span className="mt-0.5 block text-[0.8rem] leading-6 text-muted">{item.desc}</span>}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {g.featured && (
                        <Link
                          href={g.featured.href}
                          className="group/feat relative flex flex-col justify-end overflow-hidden rounded-[1.25rem] bg-navy-mesh p-6 text-white"
                        >
                          <span className="pointer-events-none absolute inset-0 bg-dot-grid opacity-60" />
                          <span className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-teal-500/30 blur-3xl" />
                          <span className="relative text-lg font-extrabold">{g.featured.title}</span>
                          <span className="relative mt-2 text-sm leading-7 text-white/75">{g.featured.text}</span>
                          <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-gold-300">
                            {g.featured.cta}
                            <ArrowUpRightIcon weight="bold" className="size-4 transition-transform group-hover/feat:-translate-y-0.5 rtl:-scale-x-100" aria-hidden />
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

        <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
          <SearchButton label={labels.search} tone={solid ? 'dark' : 'light'} />
          <LanguageSwitcher label={labels.language} tone={solid ? 'dark' : 'light'} />
          <Link href="/cooperation" className={buttonClasses('gold', 'sm', 'ms-1.5 hidden sm:inline-flex')}>
            {labels.cta}
          </Link>
          <button
            type="button"
            className={cn(
              'grid size-10 place-items-center rounded-full lg:hidden',
              solid ? 'text-navy-900 hover:bg-navy-50' : 'text-white hover:bg-white/10',
            )}
            aria-label={labels.openMenu}
            aria-expanded={mobileOpen}
            aria-controls={drawerId}
            onClick={() => setMobileOpen(true)}
          >
            <ListIcon weight="bold" className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[70] lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        inert={!mobileOpen}
      >
        <div
          className={cn('absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMobileOpen(false)}
        />
        <div
          id={drawerId}
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
          className={cn(
            'absolute inset-y-0 end-0 flex w-[min(24rem,90vw)] flex-col bg-navy-950 text-white shadow-2xl transition-transform duration-500 ease-[var(--ease-out-expo)]',
            mobileOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full',
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
          <div className="relative flex h-[4.75rem] items-center justify-between px-5">
            <Logo name={labels.brandName} sub={labels.brandSub} tone="light" />
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full hover:bg-white/10"
              aria-label={labels.closeMenu}
              onClick={() => setMobileOpen(false)}
             
            >
              <XIcon weight="bold" className="size-6" aria-hidden />
            </button>
          </div>
          <nav className="relative flex-1 overflow-y-auto px-3 pb-6" aria-label={labels.menu}>
            <ul className="space-y-1">
              {groups.map((g) =>
                g.items ? (
                  <li key={g.key}>
                    <details className="group/d rounded-2xl open:bg-white/5">
                      <summary className="flex h-12 cursor-pointer list-none items-center justify-between rounded-2xl px-4 text-base font-bold">
                        {g.label}
                        <CaretDownIcon weight="bold" className="size-4 transition-transform group-open/d:rotate-180" aria-hidden />
                      </summary>
                      <ul className="px-2 pb-2">
                        {g.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                             
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              <NavIcon name={item.icon} className="size-5 text-teal-300" />
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <li key={g.key}>
                    <Link
                      href={g.href!}
                     
                      className="flex h-12 items-center rounded-2xl px-4 text-base font-bold hover:bg-white/5"
                    >
                      {g.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <div className="relative border-t border-white/10 p-5">
            <Link href="/cooperation" className={buttonClasses('gold', 'md', 'w-full')}>
              {labels.cta}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
