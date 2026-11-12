import Link from 'next/link';
import { listSubmissions, submissionCounts } from '@sabano/db/admin';
import { submissionStatuses, submissionTypes, type SubmissionStatus, type SubmissionType } from '@sabano/db/schema';
import { buttonClasses, cn } from '@sabano/ui';
import { Badge, Empty, Flash, inputClass, PageHeader } from '@/components/admin/ui';
import { PaperclipIcon } from '@/components/icons';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { statusLabels, statusTones, typeLabels } from '../labels';

export const metadata = { title: 'درخواست‌ها' };

type SP = { status?: string; type?: string; q?: string; page?: string; deleted?: string };

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser();
  const sp = await searchParams;
  const status = submissionStatuses.includes(sp.status as SubmissionStatus) ? (sp.status as SubmissionStatus) : undefined;
  const type = submissionTypes.includes(sp.type as SubmissionType) ? (sp.type as SubmissionType) : undefined;
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const { items, total, page, pages } = listSubmissions({ status, type, q, page: Number(sp.page) || 1 });
  const counts = submissionCounts();
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, type, q, ...extra };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : '';
  };

  return (
    <>
      <PageHeader
        title="درخواست‌ها"
        description="درخواست‌های ثبت‌شده از فرم فرصت‌های همکاری"
        actions={
          <a href="/api/admin/export" download className={buttonClasses('outline', 'sm')}>
            خروجی CSV
          </a>
        }
      />
      <Flash message={sp.deleted ? 'درخواست حذف شد.' : null} />
      <div className="mb-5 flex flex-wrap gap-2">
        {[undefined, ...submissionStatuses].map((s) => (
          <Link
            key={s ?? 'all'}
            href={`/admin/submissions${qs({ status: s, page: undefined })}`}
            className={cn('rounded-full px-3.5 py-1.5 text-sm font-bold', status === s ? 'bg-navy-900 text-white' : 'border border-line bg-white text-navy-800')}
          >
            {s ? statusLabels[s] : 'همه'} <span className="opacity-60">({(counts[s ?? 'all'] ?? 0).toLocaleString('fa-IR')})</span>
          </Link>
        ))}
      </div>
      <form className="mb-6 flex flex-wrap gap-2" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <select name="type" defaultValue={type ?? ''} className={cn(inputClass, 'w-auto')}>
          <option value="">همهٔ موضوع‌ها</option>
          {submissionTypes.map((t) => (
            <option key={t} value={t}>
              {typeLabels[t]}
            </option>
          ))}
        </select>
        <input name="q" defaultValue={q} placeholder="جست‌وجو در نام، تماس، کد یا متن…" className={cn(inputClass, 'w-72 max-w-full')} />
        <button className={buttonClasses('primary', 'sm')}>اعمال</button>
      </form>

      {items.length === 0 ? (
        <Empty>درخواستی با این شرایط پیدا نشد.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">کد</th>
                <th className="px-4 py-3 text-start font-semibold">نام</th>
                <th className="px-4 py-3 text-start font-semibold">موضوع</th>
                <th className="px-4 py-3 text-start font-semibold">تاریخ</th>
                <th className="px-4 py-3 text-start font-semibold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((s) => (
                <tr key={s.id} className={cn('hover:bg-surface/60', s.status === 'new' && 'bg-gold-50/40')}>
                  <td className="px-4 py-3 font-mono text-xs" dir="ltr">
                    <Link href={`/admin/submissions/${s.id}`} className="font-bold text-teal-700">
                      {s.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/submissions/${s.id}`} className="font-bold text-navy-900">
                      {s.name}
                    </Link>
                    <span className="block text-xs text-muted" dir="ltr">
                      {s.contact}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {typeLabels[s.type]}
                    {s.attachmentPath && <PaperclipIcon className="ms-1.5 inline size-4 text-subtle" aria-label="پیوست دارد" />}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(s.createdAt, 'fa', 'short')}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTones[s.status]}>{statusLabels[s.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={`/admin/submissions${qs({ page: String(page - 1) })}`} className={buttonClasses('outline', 'sm')}>قبلی</Link>}
          <span className="text-muted">
            صفحهٔ {page.toLocaleString('fa-IR')} از {pages.toLocaleString('fa-IR')} ({total.toLocaleString('fa-IR')} مورد)
          </span>
          {page < pages && <Link href={`/admin/submissions${qs({ page: String(page + 1) })}`} className={buttonClasses('outline', 'sm')}>بعدی</Link>}
        </div>
      )}
    </>
  );
}
