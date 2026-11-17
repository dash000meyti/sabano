import Link from 'next/link';
import { submissionCounts } from '@sabano/db/admin';
import { AdminFrame } from '@/components/admin/AdminFrame';
import { AdminNav } from '@/components/admin/AdminNav';
import { Logo } from '@/components/brand/Logo';
import { ArrowUpRightIcon } from '@/components/icons';
import { requireUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { logoutAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const counts = submissionCounts();
  return (
    <AdminFrame
      newCount={counts.new}
      brand={
        <Link href="/admin" className="rounded-2xl">
          <Logo name="صبانو" sub="پنل مدیریت" tone="light" compact />
        </Link>
      }
      sidebar={
        <div className="relative flex min-h-full flex-col gap-8 p-5">
          <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />
          <Link href="/admin" className="relative rounded-2xl">
            <Logo name="صبانو" sub="پنل مدیریت" tone="light" />
          </Link>
          <div className="relative">
            <AdminNav newCount={counts.new} isAdmin={user.role === 'admin'} />
          </div>
          <div className="relative mt-auto space-y-3 border-t border-edge pt-5">
            <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-fg-muted hover:bg-tint hover:text-fg">
              <ArrowUpRightIcon className="size-4 -scale-x-100" aria-hidden />
              مشاهدهٔ سایت
            </a>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-tint px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-fg-subtle" dir="ltr">
                  {user.email}
                </p>
              </div>
              <ThemeToggle label="تغییر تم روشن و تیره" className="size-10 shrink-0" />
              <form action={logoutAction}>
                <button type="submit" className="min-h-10 rounded-lg px-2.5 text-xs font-bold text-gold-300 hover:bg-tint">
                  خروج
                </button>
              </form>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </AdminFrame>
  );
}
