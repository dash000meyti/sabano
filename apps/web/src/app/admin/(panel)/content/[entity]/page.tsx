import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminList } from '@sabano/db/admin';
import { locales, localeMeta } from '@sabano/i18n';
import { buttonClasses } from '@sabano/ui';
import { SortableList } from '@/components/admin/SortableList';
import { Empty, Flash, PageHeader } from '@/components/admin/ui';
import { entities, isEntityKey } from '@/lib/admin-entities';
import { requireUser } from '@/lib/auth';

export default async function EntityListPage({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ deleted?: string }> }) {
  await requireUser();
  const { entity } = await params;
  if (!isEntityKey(entity)) notFound();
  const { deleted } = await searchParams;
  const cfg = entities[entity];
  const rows = adminList(entity);
  const items = rows.map((r) => {
    const fa = r.translations.fa ?? r.translations.en ?? Object.values(r.translations)[0] ?? {};
    const missing = locales.filter((l) => !r.translations[l]);
    return {
      id: r.id,
      title: String(fa[cfg.titleField] ?? '—'),
      subtitle: cfg.subtitleField ? (fa[cfg.subtitleField] as string | null) : null,
      ...(cfg.imageField ? { image: (r[cfg.imageField] as string | null) ?? null } : {}),
      href: `/admin/content/${entity}/${r.id}`,
      badges: [
        ...(r.published === false ? [{ label: 'پنهان', tone: 'gray' as const }] : []),
        ...(missing.length ? [{ label: `بدون ${missing.map((l) => localeMeta[l].short).join('، ')}`, tone: 'gold' as const }] : [{ label: '۵ زبان', tone: 'teal' as const }]),
      ],
    };
  });
  return (
    <>
      <PageHeader
        title={cfg.title}
        description={cfg.description}
        actions={
          <Link href={`/admin/content/${entity}/new`} className={buttonClasses('primary', 'sm')}>
            + افزودن {cfg.singular}
          </Link>
        }
      />
      <Flash message={deleted ? 'مورد حذف شد.' : null} />
      {items.length ? <SortableList entity={entity} items={items} /> : <Empty>هنوز موردی اضافه نشده است.</Empty>}
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  return { title: isEntityKey(entity) ? entities[entity].title : 'محتوا' };
}
