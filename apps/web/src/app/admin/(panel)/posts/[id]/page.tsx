import { notFound } from 'next/navigation';
import { adminGet } from '@sabano/db/admin';
import { PostForm } from '@/components/admin/PostForm';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'ویرایش مطلب' };

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireUser();
  const record = adminGet('posts', Number((await params).id));
  if (!record) notFound();
  const { saved, error } = await searchParams;
  return <PostForm record={record} saved={!!saved} error={error} />;
}
