import Link from 'next/link';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr';
import { buttonClasses } from '@sabano/ui';

export default function AdminNotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <title>صفحه پیدا نشد | پنل مدیریت صبانو</title>
      <div className="max-w-md rounded-2xl border border-edge bg-card p-10 text-center shadow-card">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
          <MagnifyingGlassIcon weight="duotone" className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-fg">این صفحه پیدا نشد</h1>
        <p className="mt-2 text-sm leading-7 text-fg-muted">ممکن است این مورد حذف شده باشد یا نشانی را اشتباه وارد کرده باشید.</p>
        <Link href="/admin" className={buttonClasses('primary', 'md', 'mt-6')}>
          بازگشت به داشبورد
        </Link>
      </div>
    </div>
  );
}
