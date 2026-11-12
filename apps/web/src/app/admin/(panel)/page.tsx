import Link from 'next/link';
import { dashboardStats, listSubmissions, submissionCounts } from '@sabano/db/admin';
import { locales, localeMeta } from '@sabano/i18n';
import { Badge, Card, Flash, PageHeader } from '@/components/admin/ui';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { statusLabels, statusTones, typeLabels } from './labels';

export const metadata = { title: 'داشبورد' };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const counts = submissionCounts();
  const stats = dashboardStats();
  const recent = listSubmissions({ perPage: 6 }).items;
  const tiles = [
    { label: 'درخواست‌های جدید', value: counts.new, href: '/admin/submissions?status=new', accent: true },
    { label: 'همهٔ درخواست‌ها', value: counts.all, href: '/admin/submissions' },
    { label: 'مطالب منتشرشده', value: stats.published, href: '/admin/posts' },
    { label: 'پرسش‌های متداول', value: stats.faqs, href: '/admin/content/faqs' },
  ];
  return (
    <>
      <PageHeader title={`سلام، ${user.name}`} description="خلاصهٔ وضعیت سایت و آخرین درخواست‌ها" />
      <Flash message={denied ? 'برای این بخش دسترسی مدیر کل لازم است.' : null} tone="red" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={t.accent ? 'rounded-2xl bg-navy-mesh p-6 text-white shadow-lift' : 'rounded-2xl border border-line bg-white p-6 shadow-card hover:border-teal-200'}
          >
            <p className={t.accent ? 'text-sm text-white/70' : 'text-sm text-muted'}>{t.label}</p>
            <p className={t.accent ? 'text-gradient-gold mt-2 text-4xl font-black' : 'mt-2 text-4xl font-black text-navy-900'}>{t.value.toLocaleString('fa-IR')}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="آخرین درخواست‌ها" actions={<Link href="/admin/submissions" className="text-sm font-bold text-teal-700">همه</Link>}>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">هنوز درخواستی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/submissions/${s.id}`} className="flex items-center gap-4 py-3 hover:bg-surface/60">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-navy-900">{s.name}</span>
                      <span className="block truncate text-xs text-muted">{typeLabels[s.type]} · {formatDate(s.createdAt, 'fa', 'short')}</span>
                    </span>
                    <Badge tone={statusTones[s.status]}>{statusLabels[s.status]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="وضعیت ترجمه‌ها" description="تعداد مطالب و پرسش‌هایی که در هر زبان منتشر می‌شوند">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="pb-2 text-start font-semibold">زبان</th>
                <th className="pb-2 text-start font-semibold">مطالب</th>
                <th className="pb-2 text-start font-semibold">پرسش‌ها</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {locales.map((l) => {
                const p = stats.postLocales[l] ?? 0;
                const f = stats.faqLocales[l] ?? 0;
                return (
                  <tr key={l}>
                    <td className="py-2.5 font-bold text-navy-900">{localeMeta[l].name}</td>
                    <td className="py-2.5">
                      <Badge tone={p < stats.posts ? 'gold' : 'teal'}>
                        {p.toLocaleString('fa-IR')} / {stats.posts.toLocaleString('fa-IR')}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge tone={f < stats.faqs ? 'gold' : 'teal'}>
                        {f.toLocaleString('fa-IR')} / {stats.faqs.toLocaleString('fa-IR')}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
