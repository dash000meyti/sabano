import { listMedia } from '@sabano/db/admin';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Card, Empty, PageHeader } from '@/components/admin/ui';
import { requireUser } from '@/lib/auth';
import { CopyPath } from './CopyPath';
import { deleteMediaAction, uploadManyAction } from './actions';

export const metadata = { title: 'کتابخانهٔ رسانه' };

export default async function MediaPage() {
  await requireUser();
  const items = listMedia();
  return (
    <>
      <PageHeader title="کتابخانهٔ رسانه" description="تصاویر بارگذاری‌شده برای مطالب، لوگوها و عکس‌ها. تصاویر هنگام نمایش به‌صورت خودکار به AVIF/WebP بهینه می‌شوند." />
      <Card title="بارگذاری تصویر" className="mb-6">
        <form action={uploadManyAction} className="flex flex-wrap items-center gap-3">
          <input type="file" name="files" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="w-full min-w-0 max-w-full text-sm file:me-3 file:rounded-lg file:border-0 file:bg-fg file:px-4 file:py-2 file:text-sm file:font-bold file:text-canvas" />
          <SubmitButton>بارگذاری</SubmitButton>
        </form>
      </Card>
      {items.length === 0 ? (
        <Empty>هنوز تصویری بارگذاری نشده است.</Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {items.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-2xl border border-edge bg-card shadow-card">
              <div className="aspect-square bg-canvas-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/media/${m.path}`} alt={m.alt ?? ''} loading="lazy" className="size-full object-contain" />
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-xs font-bold text-fg" dir="auto" title={m.originalName}>
                  {m.originalName}
                </p>
                <p className="text-[0.68rem] text-fg-muted" dir="ltr">
                  {m.width}×{m.height} · {Math.ceil(m.size / 1024)} KB
                </p>
                <div className="flex items-center justify-between">
                  <CopyPath path={`/media/${m.path}`} />
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitButton variant="ghost" className="h-7 px-2 text-xs text-danger hover:bg-danger-soft" confirm="این تصویر حذف شود؟ اگر جایی استفاده شده باشد، دیگر نمایش داده نمی‌شود.">
                      حذف
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
