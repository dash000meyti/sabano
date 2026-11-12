import Link from 'next/link';
import { adminList } from '@sabano/db/admin';
import { locales, localeMeta } from '@sabano/i18n';
import { buttonClasses } from '@sabano/ui';
import { Badge, Empty, Flash, PageHeader } from '@/components/admin/ui';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'اخبار و تحلیل' };
const categoryLabels: Record<string, string> = { news: 'خبر', insight: 'تحلیل', guide: 'راهنما' };

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireUser();
  const { deleted } = await searchParams;
  const posts = adminList('posts');
  return (
    <>
      <PageHeader
        title="اخبار و تحلیل"
        description="هر مطلب فقط در زبان‌هایی منتشر می‌شود که عنوان و متن دارد."
        actions={
          <Link href="/admin/posts/new" className={buttonClasses('primary', 'sm')}>
            + مطلب جدید
          </Link>
        }
      />
      <Flash message={deleted ? 'مطلب حذف شد.' : null} />
      {posts.length === 0 ? (
        <Empty>هنوز مطلبی نوشته نشده است.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">عنوان</th>
                <th className="px-4 py-3 text-start font-semibold">دسته</th>
                <th className="px-4 py-3 text-start font-semibold">وضعیت</th>
                <th className="px-4 py-3 text-start font-semibold">تاریخ انتشار</th>
                <th className="px-4 py-3 text-start font-semibold">زبان‌ها</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => {
                const t = p.translations.fa ?? p.translations.en ?? Object.values(p.translations)[0];
                const scheduled = p.status === 'published' && p.publishedAt instanceof Date && p.publishedAt > new Date();
                return (
                  <tr key={p.id} className="hover:bg-surface/60">
                    <td className="max-w-md px-4 py-3">
                      <Link href={`/admin/posts/${p.id}`} className="line-clamp-2 font-bold text-navy-900">
                        {String(t?.title ?? '—')}
                      </Link>
                      <span className="block text-xs text-subtle" dir="ltr">
                        /news/{String(p.slug)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{categoryLabels[String(p.category)]}</td>
                    <td className="px-4 py-3">
                      {scheduled ? <Badge tone="gold">زمان‌بندی‌شده</Badge> : p.status === 'published' ? <Badge tone="teal">منتشرشده</Badge> : <Badge>پیش‌نویس</Badge>}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.publishedAt instanceof Date ? formatDate(p.publishedAt, 'fa', 'short') : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="flex gap-1">
                        {locales.map((l) => (
                          <span key={l} className={p.translations[l] ? 'rounded bg-teal-50 px-1.5 text-[0.65rem] font-bold text-teal-700' : 'rounded bg-surface px-1.5 text-[0.65rem] text-subtle line-through'}>
                            {localeMeta[l].short}
                          </span>
                        ))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
