'use server';

import { redirect } from 'next/navigation';
import { readingMinutes } from '@sabano/db';
import { adminDelete, adminSave, slugExists } from '@sabano/db/admin';
import { postCategories, type PostCategory } from '@sabano/db/schema';
import { locales, type Locale } from '@sabano/i18n';
import { requireUser } from '@/lib/auth';
import { revalidateSite } from '@/lib/revalidate';
import { sanitizeArticle } from '@/lib/sanitize';

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export async function savePostAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get('_id')) || null;
  const errors: string[] = [];
  const slug = str(formData, 'slug').toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push('شناسهٔ لاتین (slug) فقط حروف کوچک انگلیسی، عدد و خط تیره می‌پذیرد.');
  else if (slugExists('posts', slug, id ?? undefined)) errors.push('این شناسه قبلاً برای مطلب دیگری استفاده شده است.');
  const category = str(formData, 'category') as PostCategory;
  const status = str(formData, 'status') === 'published' ? 'published' : 'draft';
  const when = str(formData, 'publishedAt');
  // datetime-local values are entered in Tehran time
  const publishedAt = when ? new Date(`${when}:00+03:30`) : status === 'published' ? new Date() : null;

  const translations: Partial<Record<Locale, Record<string, unknown>>> = {};
  for (const l of locales) {
    const title = str(formData, `t.${l}.title`);
    if (!title) continue;
    const body = sanitizeArticle(String(formData.get(`t.${l}.body`) ?? ''));
    const excerpt = str(formData, `t.${l}.excerpt`);
    if (!excerpt) errors.push(`خلاصهٔ مطلب در زبان ${l} الزامی است.`);
    translations[l] = {
      title,
      excerpt,
      body,
      coverAlt: str(formData, `t.${l}.coverAlt`) || null,
      seoTitle: str(formData, `t.${l}.seoTitle`) || null,
      seoDescription: str(formData, `t.${l}.seoDescription`) || null,
      readingMinutes: readingMinutes(body, l === 'fa' ? 180 : 200),
    };
  }
  if (!Object.keys(translations).length) errors.push('حداقل یک زبان باید عنوان داشته باشد.');
  if (errors.length) redirect(`${id ? `/admin/posts/${id}` : '/admin/posts/new'}?error=${encodeURIComponent(errors.slice(0, 4).join(' '))}`);

  const savedId = adminSave(
    'posts',
    id,
    {
      slug,
      category: postCategories.includes(category) ? category : 'news',
      coverImage: str(formData, 'coverImage') || null,
      status,
      featured: formData.get('featured') === 'on',
      publishedAt,
    },
    translations,
  );
  revalidateSite(status === 'published' ? ['/news', `/news/${slug}`] : []);
  redirect(`/admin/posts/${savedId}?saved=1`);
}

export async function deletePostAction(formData: FormData) {
  await requireUser();
  adminDelete('posts', Number(formData.get('_id')));
  revalidateSite();
  redirect('/admin/posts?deleted=1');
}
