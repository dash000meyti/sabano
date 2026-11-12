import { DATA_DIR, DATABASE_PATH, listBackups } from '@sabano/db';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Card, Flash, PageHeader } from '@/components/admin/ui';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { backupNowAction, purgeCacheAction } from './actions';

export const metadata = { title: 'پشتیبان و سیستم' };

export default async function SystemPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireUser('admin');
  const { saved } = await searchParams;
  const backups = listBackups();
  return (
    <>
      <PageHeader title="پشتیبان و سیستم" description="از پایگاه داده هر روز به‌صورت خودکار پشتیبان گرفته می‌شود و ۱۴ نسخهٔ آخر نگه داشته می‌شود." />
      <Flash message={saved === 'backup' ? 'نسخهٔ پشتیبان ساخته شد.' : saved === 'cache' ? 'کش سایت پاک شد؛ صفحات در اولین بازدید دوباره ساخته می‌شوند.' : null} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card title="نسخه‌های پشتیبان" actions={<form action={backupNowAction}><SubmitButton>پشتیبان‌گیری اکنون</SubmitButton></form>}>
          {backups.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">هنوز نسخهٔ پشتیبانی وجود ندارد.</p>
          ) : (
            <ul className="divide-y divide-line">
              {backups.map((b) => (
                <li key={b.name} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="block font-bold text-navy-900">{formatDate(b.createdAt, 'fa')}</span>
                    <span className="text-xs text-muted" dir="ltr">
                      {b.name} · {(b.size / 1024).toFixed(0)} KB
                    </span>
                  </span>
                  <a href={`/api/admin/backups/${encodeURIComponent(b.name)}`} className="rounded-lg px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-50">
                    دانلود
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="space-y-6">
          <Card title="کش سایت" description="بعد از هر ذخیره در پنل، سایت به‌صورت خودکار به‌روز می‌شود. اگر تغییری دیده نشد، کش را دستی پاک کنید.">
            <form action={purgeCacheAction}>
              <SubmitButton variant="outline">پاک کردن کش</SubmitButton>
            </form>
          </Card>
          <Card title="مسیرهای ذخیره‌سازی">
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-muted">پوشهٔ داده</dt>
                <dd className="mt-1 font-mono text-navy-900" dir="ltr">{DATA_DIR}</dd>
              </div>
              <div>
                <dt className="text-muted">پایگاه داده</dt>
                <dd className="mt-1 font-mono text-navy-900" dir="ltr">{DATABASE_PATH}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
