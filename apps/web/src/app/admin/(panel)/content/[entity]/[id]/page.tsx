import { notFound } from 'next/navigation';
import { adminGet } from '@sabano/db/admin';
import { EntityForm } from '@/components/admin/EntityForm';
import { entities, isEntityKey } from '@/lib/admin-entities';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'ویرایش' };

export default async function EditEntityPage({ params, searchParams }: { params: Promise<{ entity: string; id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireUser();
  const { entity, id } = await params;
  if (!isEntityKey(entity)) notFound();
  const record = adminGet(entity, Number(id));
  if (!record) notFound();
  const { saved, error } = await searchParams;
  return <EntityForm cfg={entities[entity]} record={record} saved={!!saved} error={error} />;
}
