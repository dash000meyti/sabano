'use client';

import {
  BriefcaseIcon,
  BuildingsIcon,
  GaugeIcon,
  GearSixIcon,
  HandshakeIcon,
  ImagesIcon,
  NewspaperIcon,
  QuestionIcon,
  TrayIcon,
  UserGearIcon,
  UsersThreeIcon,
  HardDrivesIcon,
  type Icon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@sabano/ui';

type Item = { href: string; label: string; icon: Icon; badge?: number; adminOnly?: boolean };

export function AdminNav({ newCount, isAdmin }: { newCount: number; isAdmin: boolean }) {
  const pathname = usePathname();
  const groups: { title: string; items: Item[] }[] = [
    {
      title: 'کلی',
      items: [
        { href: '/admin', label: 'داشبورد', icon: GaugeIcon },
        { href: '/admin/submissions', label: 'درخواست‌ها', icon: TrayIcon, badge: newCount },
      ],
    },
    {
      title: 'محتوا',
      items: [
        { href: '/admin/posts', label: 'اخبار و تحلیل', icon: NewspaperIcon },
        { href: '/admin/content/faqs', label: 'پرسش‌های متداول', icon: QuestionIcon },
        { href: '/admin/content/people', label: 'مدیران', icon: UsersThreeIcon },
        { href: '/admin/content/companies', label: 'پورتفولیو', icon: BriefcaseIcon },
        { href: '/admin/content/partners', label: 'نهادهای مرتبط', icon: HandshakeIcon },
        { href: '/admin/content/shareholders', label: 'سهامداران', icon: BuildingsIcon },
        { href: '/admin/media', label: 'کتابخانهٔ رسانه', icon: ImagesIcon },
      ],
    },
    {
      title: 'سیستم',
      items: [
        { href: '/admin/settings', label: 'تنظیمات سایت', icon: GearSixIcon },
        { href: '/admin/users', label: 'کاربران', icon: UserGearIcon, adminOnly: true },
        { href: '/admin/system', label: 'پشتیبان و سیستم', icon: HardDrivesIcon, adminOnly: true },
      ],
    },
  ];
  return (
    <nav className="space-y-6" aria-label="منوی پنل">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 text-[0.7rem] font-bold text-white/40">{g.title}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items
              .filter((i) => !i.adminOnly || isAdmin)
              .map((i) => {
                const active = i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href);
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                        active ? 'bg-white text-navy-900 shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <i.icon weight={active ? 'fill' : 'duotone'} className={cn('size-5', active ? 'text-teal-600' : 'text-teal-300')} aria-hidden />
                      <span className="flex-1">{i.label}</span>
                      {!!i.badge && <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[0.7rem] font-black text-navy-950">{i.badge}</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
