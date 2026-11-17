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
            className={cn('rounded-full px-3.5 py-1.5 text-sm font-bold', status === s ? 'bg-fg text-canvas' : 'border border-edge bg-card text-fg')}
          >
            {s ? statusLabels[s] : 'همه'} <span className="opacity-60">({(counts[s ?? 'all'] ?? 0).toLocaleString('fa-IR')})</span>
          </Link>
        ))}
      </div>
      <form className="mb-6 flex flex-wrap gap-2" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <select name="type" defaultValue={type ?? ''} aria-label="موضوع" className={cn(inputClass, 'w-full sm:w-auto')}>
          <option value="">همهٔ موضوع‌ها</option>
          {submissionTypes.map((t) => (
            <option key={t} value={t}>
              {typeLabels[t]}
            </option>
          ))}
        </select>
        <input name="q" defaultValue={q} placeholder="جست‌وجو در نام، تماس، کد یا متن…" aria-label="جست‌وجو" className={cn(inputClass, 'min-w-0 flex-1 sm:w-72 sm:flex-none')} />
        <button className={buttonClasses('primary', 'md')}>اعمال</button>
      </form>

      {items.length === 0 ? (
        <Empty>درخواستی با این شرایط پیدا نشد.</Empty>
      ) : (
        <>
        {/* Phones: one card per request */}
        <ul className="grid gap-3 md:hidden">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/submissions/${s.id}`}
                className={cn('block rounded-2xl border p-4 shadow-card active:bg-canvas-alt', s.status === 'new' ? 'border-gold-edge bg-gold-soft' : 'border-edge bg-card')}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-fg">{s.name}</span>
                    <span className="block truncate text-xs text-fg-muted" dir="ltr">
                      {s.contact}
                    </span>
                  </span>
                  <Badge tone={statusTones[s.status]}>{statusLabels[s.status]}</Badge>
                </span>
                <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                  <span className="font-mono font-bold text-accent" dir="ltr">
                    {s.code}
                  </span>
                  <span>
                    {typeLabels[s.type]}
                    {s.attachmentPath && <PaperclipIcon className="ms-1 inline size-3.5" aria-label="پیوست دارد" />}
                  </span>
                  <span>{formatDate(s.createdAt, 'fa', 'short')}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-2xl border border-edge bg-card shadow-card md:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-canvas-alt text-xs text-fg-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">کد</th>
                <th className="px-4 py-3 text-start font-semibold">نام</th>
                <th className="px-4 py-3 text-start font-semibold">موضوع</th>
                <th className="px-4 py-3 text-start font-semibold">تاریخ</th>
                <th className="px-4 py-3 text-start font-semibold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {items.map((s) => (
                <tr key={s.id} className={cn('hover:bg-canvas-alt/60', s.status === 'new' && 'bg-gold-soft')}>
                  <td className="px-4 py-3 font-mono text-xs" dir="ltr">
                    <Link href={`/admin/submissions/${s.id}`} className="font-bold text-accent">
                      {s.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/submissions/${s.id}`} className="font-bold text-fg">
                      {s.name}
                    </Link>
                    <span className="block text-xs text-fg-muted" dir="ltr">
                      {s.contact}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {typeLabels[s.type]}
                    {s.attachmentPath && <PaperclipIcon className="ms-1.5 inline size-4 text-fg-subtle" aria-label="پیوست دارد" />}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{formatDate(s.createdAt, 'fa', 'short')}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTones[s.status]}>{statusLabels[s.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
      {pages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={`/admin/submissions${qs({ page: String(page - 1) })}`} className={buttonClasses('outline', 'sm')}>قبلی</Link>}
          <span className="text-fg-muted">
            صفحهٔ {page.toLocaleString('fa-IR')} از {pages.toLocaleString('fa-IR')} ({total.toLocaleString('fa-IR')} مورد)
          </span>
          {page < pages && <Link href={`/admin/submissions${qs({ page: String(page + 1) })}`} className={buttonClasses('outline', 'sm')}>بعدی</Link>}
        </div>
      )}
    </>
  );
}
