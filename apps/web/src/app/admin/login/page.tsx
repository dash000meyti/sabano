import { redirect } from 'next/navigation';
import { countUsers } from '@sabano/db/users';
import { Aurora, Orbits } from '@/components/decor/Aurora';
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
      <section className="scheme-dark grain relative isolate hidden overflow-hidden bg-night p-12 text-fg lg:flex lg:flex-col lg:justify-between">
        <Aurora />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
        <Orbits className="pointer-events-none absolute -bottom-40 -end-40 w-[44rem] opacity-50" />
        <Logo name="صبانو" sub="پنل مدیریت" tone="light" />
        <div className="relative max-w-md">
          <h1 className="text-4xl font-black leading-tight">مدیریت محتوای سایت صبانو</h1>
          <p className="mt-4 leading-8 text-fg-muted">درخواست‌ها، اخبار، پرسش‌های متداول، مدیران، پورتفولیو و تنظیمات سایت را از اینجا مدیریت کنید.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo name="صبانو" sub="پنل مدیریت" />
          </div>
          <h2 className="text-2xl font-extrabold text-fg">ورود به پنل</h2>
          <p className="mt-2 text-sm text-fg-muted">با حساب کاربری مدیریت وارد شوید.</p>
          {noUsers && (
            <p className="mt-6 rounded-xl border border-gold-edge bg-gold-soft p-4 text-sm leading-7 text-fg">
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
