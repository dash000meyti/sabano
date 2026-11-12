import { PostForm } from '@/components/admin/PostForm';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'مطلب جدید' };

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { error } = await searchParams;
  return <PostForm error={error} />;
}
