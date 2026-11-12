import Link from 'next/link';
import { submissionCounts } from '@sabano/db/admin';
import { AdminNav } from '@/components/admin/AdminNav';
import { Logo } from '@/components/brand/Logo';
import { ArrowUpRightIcon } from '@/components/icons';
import { requireUser } from '@/lib/auth';
import { logoutAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const counts = submissionCounts();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[17rem_1fr]">
      <aside className="relative bg-navy-mesh text-white lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30" />
        <div className="relative flex h-full flex-col gap-8 p-5">
          <Link href="/admin" className="rounded-2xl">
            <Logo name="صبانو" sub="پنل مدیریت" tone="light" />
          </Link>
          <AdminNav newCount={counts.new} isAdmin={user.role === 'admin'} />
          <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
            <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
              <ArrowUpRightIcon className="size-4 -scale-x-100" aria-hidden />
              مشاهدهٔ سایت
            </a>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-[0.7rem] text-white/50" dir="ltr">
                  {user.email}
                </p>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="rounded-lg px-2 py-1 text-xs font-bold text-gold-300 hover:bg-white/10">
                  خروج
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
