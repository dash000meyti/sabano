import { redirect } from 'next/navigation';
import { countUsers } from '@sabano/db/users';
import { DataLines } from '@/components/decor/DataLines';
import { Logo } from '@/components/brand/Logo';
import { getSessionUser } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'ورود' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSessionUser()) redirect('/admin');
  const { next } = await searchParams;
  const noUsers = countUsers() === 0;
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-navy-mesh p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
        <DataLines className="absolute bottom-0 end-0 w-[85%] opacity-70 rtl:-scale-x-100" />
        <Logo name="صبانو" sub="پنل مدیریت" tone="light" />
        <div className="relative max-w-md">
          <h1 className="text-4xl font-black leading-tight">مدیریت محتوای سایت صبانو</h1>
          <p className="mt-4 leading-8 text-white/70">درخواست‌ها، اخبار، پرسش‌های متداول، مدیران، پورتفولیو و تنظیمات سایت را از اینجا مدیریت کنید.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo name="صبانو" sub="پنل مدیریت" />
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900">ورود به پنل</h2>
          <p className="mt-2 text-sm text-muted">با حساب کاربری مدیریت وارد شوید.</p>
          {noUsers && (
            <p className="mt-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm leading-7 text-navy-800">
              هنوز هیچ کاربری ساخته نشده است. اولین مدیر را با دستور <code dir="ltr" className="font-mono text-xs">pnpm admin:create</code> یا متغیرهای محیطی <code dir="ltr" className="font-mono text-xs">ADMIN_EMAIL</code> و <code dir="ltr" className="font-mono text-xs">ADMIN_PASSWORD</code> بسازید.
            </p>
          )}
          <div className="mt-8">
            <LoginForm next={next} />
          </div>
        </div>
      </section>
    </main>
  );
}
