import { notFound } from 'next/navigation';
import { EntityForm } from '@/components/admin/EntityForm';
import { entities, isEntityKey } from '@/lib/admin-entities';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'افزودن' };

export default async function NewEntityPage({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { entity } = await params;
  if (!isEntityKey(entity)) notFound();
  const { error } = await searchParams;
  return <EntityForm cfg={entities[entity]} error={error} />;
}
