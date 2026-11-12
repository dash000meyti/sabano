import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubmission, updateSubmission } from '@sabano/db/admin';
import { submissionStatuses } from '@sabano/db/schema';
import { localeMeta, type Locale } from '@sabano/i18n';
import { buttonClasses } from '@sabano/ui';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Badge, Card, Field, Flash, inputClass, PageHeader } from '@/components/admin/ui';
import { DownloadSimpleIcon, PaperclipIcon } from '@/components/icons';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { statusLabels, statusTones, typeLabels } from '../../labels';
import { deleteSubmissionAction, updateSubmissionAction } from '../actions';

export const metadata = { title: 'جزئیات درخواست' };

export default async function SubmissionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { saved } = await searchParams;
  const s = getSubmission(Number(id));
  if (!s) notFound();
  // Opening a new request moves it to "reviewing" automatically.
  if (s.status === 'new') {
    updateSubmission(s.id, { status: 'reviewing' });
    s.status = 'reviewing';
  }
  const isEmail = s.contact.includes('@');
  const time = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' }).format(s.createdAt);

  return (
    <>
      <PageHeader
        title={s.name}
        description={`${typeLabels[s.type]} · ${formatDate(s.createdAt, 'fa')} ساعت ${time}`}
        actions={
          <Link href="/admin/submissions" className={buttonClasses('outline', 'sm')}>
            بازگشت به فهرست
          </Link>
        }
      />
      <Flash message={saved ? 'تغییرات ذخیره شد.' : null} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card title="متن درخواست">
            <p className="whitespace-pre-wrap text-[0.95rem] leading-8 text-navy-900" dir="auto">
              {s.message}
            </p>
          </Card>
          {s.attachmentPath && (
            <Card title="فایل پیوست">
              <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
                <PaperclipIcon weight="duotone" className="size-7 text-teal-600" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy-900" dir="auto">
                    {s.attachmentName}
                  </p>
                  <p className="text-xs text-muted" dir="ltr">
                    {s.attachmentMime} · {Math.ceil((s.attachmentSize ?? 0) / 1024)} KB
                  </p>
                </div>
                <a href={`/api/admin/files/${s.id}`} className={buttonClasses('primary', 'sm')}>
                  <DownloadSimpleIcon className="size-4" aria-hidden />
                  دانلود
                </a>
              </div>
            </Card>
          )}
        </div>
        <div className="space-y-6">
          <Card title="مشخصات">
            <dl className="space-y-3.5 text-sm">
              <div>
                <dt className="text-xs text-muted">کد پیگیری</dt>
                <dd className="mt-0.5 font-mono font-bold text-navy-900" dir="ltr">
                  {s.code}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">راه تماس</dt>
                <dd className="mt-0.5 font-bold" dir="ltr">
                  <a href={isEmail ? `mailto:${s.contact}` : `tel:${s.contact}`} className="text-teal-700">
                    {s.contact}
                  </a>
                </dd>
              </div>
              {s.company && (
                <div>
                  <dt className="text-xs text-muted">شرکت</dt>
                  <dd className="mt-0.5 font-bold text-navy-900">{s.company}</dd>
                </div>
              )}
              {s.website && (
                <div>
                  <dt className="text-xs text-muted">وب‌سایت</dt>
                  <dd className="mt-0.5" dir="ltr">
                    <a href={s.website} target="_blank" rel="noopener noreferrer nofollow" className="font-bold text-teal-700">
                      {s.website}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted">زبان فرم</dt>
                <dd className="mt-0.5 font-bold text-navy-900">{localeMeta[s.locale as Locale]?.name ?? s.locale}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">وضعیت فعلی</dt>
                <dd className="mt-1">
                  <Badge tone={statusTones[s.status]}>{statusLabels[s.status]}</Badge>
                </dd>
              </div>
            </dl>
          </Card>
          <Card title="پیگیری">
            <form action={updateSubmissionAction} className="space-y-4">
              <input type="hidden" name="id" value={s.id} />
              <Field label="وضعیت" htmlFor="status">
                <select id="status" name="status" defaultValue={s.status} className={inputClass}>
                  {submissionStatuses.map((st) => (
                    <option key={st} value={st}>
                      {statusLabels[st]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="یادداشت داخلی" hint="فقط برای کارکنان صندوق قابل مشاهده است." htmlFor="notes">
                <textarea id="notes" name="notes" rows={5} defaultValue={s.notes ?? ''} className={inputClass} />
              </Field>
              <SubmitButton>ذخیره</SubmitButton>
            </form>
          </Card>
          {user.role === 'admin' && (
            <form action={deleteSubmissionAction}>
              <input type="hidden" name="id" value={s.id} />
              <SubmitButton variant="ghost" className="text-red-600 hover:bg-red-50" confirm="این درخواست و فایل پیوست آن برای همیشه حذف شود؟">
                حذف درخواست
              </SubmitButton>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
