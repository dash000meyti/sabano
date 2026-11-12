'use server';

import fs from 'node:fs/promises';
import { revalidatePath } from 'next/cache';
import { deleteMediaRow } from '@sabano/db/admin';
import { requireUser } from '@/lib/auth';
import { mediaAbsolutePath, storeImage } from '@/lib/media';

export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireUser();
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'فایلی انتخاب نشده است.' };
  try {
    const saved = await storeImage(file, String(formData.get('alt') ?? '') || undefined);
    revalidatePath('/admin/media');
    return { url: saved.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'بارگذاری انجام نشد.' };
  }
}

export async function uploadManyAction(formData: FormData) {
  await requireUser();
  for (const f of formData.getAll('files')) {
    if (f instanceof File && f.size > 0) await storeImage(f).catch(() => null);
  }
  revalidatePath('/admin/media');
}

export async function deleteMediaAction(formData: FormData) {
  await requireUser();
  const row = deleteMediaRow(Number(formData.get('id')));
  if (row) await fs.rm(mediaAbsolutePath(row.path), { force: true });
  revalidatePath('/admin/media');
}
