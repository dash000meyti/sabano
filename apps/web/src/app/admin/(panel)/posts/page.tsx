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
        <>
        {/* Phones: one card per post */}
        <ul className="grid gap-3 md:hidden">
          {posts.map((p) => {
            const t = p.translations.fa ?? p.translations.en ?? Object.values(p.translations)[0];
            const scheduled = p.status === 'published' && p.publishedAt instanceof Date && p.publishedAt > new Date();
            return (
              <li key={p.id}>
                <Link href={`/admin/posts/${p.id}`} className="block rounded-2xl border border-edge bg-card p-4 shadow-card active:bg-canvas-alt">
                  <span className="line-clamp-2 font-bold leading-7 text-fg">{String(t?.title ?? '—')}</span>
                  <span className="mt-1 block truncate text-xs text-fg-subtle" dir="ltr">
                    /news/{String(p.slug)}
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                    {scheduled ? <Badge tone="gold">زمان‌بندی‌شده</Badge> : p.status === 'published' ? <Badge tone="teal">منتشرشده</Badge> : <Badge>پیش‌نویس</Badge>}
                    <span>{categoryLabels[String(p.category)]}</span>
                    <span>{p.publishedAt instanceof Date ? formatDate(p.publishedAt, 'fa', 'short') : '—'}</span>
                  </span>
                  <span className="mt-3 flex gap-1">
                    {locales.map((l) => (
                      <span key={l} className={p.translations[l] ? 'rounded bg-accent-soft px-1.5 text-xs font-bold text-accent' : 'rounded bg-canvas-alt px-1.5 text-xs text-fg-subtle line-through'}>
                        {localeMeta[l].short}
                      </span>
                    ))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-x-auto rounded-2xl border border-edge bg-card shadow-card md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-canvas-alt text-xs text-fg-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">عنوان</th>
                <th className="px-4 py-3 text-start font-semibold">دسته</th>
                <th className="px-4 py-3 text-start font-semibold">وضعیت</th>
                <th className="px-4 py-3 text-start font-semibold">تاریخ انتشار</th>
                <th className="px-4 py-3 text-start font-semibold">زبان‌ها</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {posts.map((p) => {
                const t = p.translations.fa ?? p.translations.en ?? Object.values(p.translations)[0];
                const scheduled = p.status === 'published' && p.publishedAt instanceof Date && p.publishedAt > new Date();
                return (
                  <tr key={p.id} className="hover:bg-canvas-alt/60">
                    <td className="max-w-md px-4 py-3">
                      <Link href={`/admin/posts/${p.id}`} className="line-clamp-2 font-bold text-fg">
                        {String(t?.title ?? '—')}
                      </Link>
                      <span className="block text-xs text-fg-subtle" dir="ltr">
                        /news/{String(p.slug)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{categoryLabels[String(p.category)]}</td>
                    <td className="px-4 py-3">
                      {scheduled ? <Badge tone="gold">زمان‌بندی‌شده</Badge> : p.status === 'published' ? <Badge tone="teal">منتشرشده</Badge> : <Badge>پیش‌نویس</Badge>}
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{p.publishedAt instanceof Date ? formatDate(p.publishedAt, 'fa', 'short') : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="flex gap-1">
                        {locales.map((l) => (
                          <span key={l} className={p.translations[l] ? 'rounded bg-accent-soft px-1.5 text-xs font-bold text-accent' : 'rounded bg-canvas-alt px-1.5 text-xs text-fg-subtle line-through'}>
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
        </>
      )}
    </>
  );
}
