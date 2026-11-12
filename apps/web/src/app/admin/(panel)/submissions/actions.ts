'use server';

import fs from 'node:fs/promises';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { deleteSubmission, updateSubmission } from '@sabano/db/admin';
import { submissionStatuses, type SubmissionStatus } from '@sabano/db/schema';
import { requireUser } from '@/lib/auth';
import { uploadAbsolutePath } from '@/lib/uploads';

export async function updateSubmissionAction(formData: FormData) {
  await requireUser();
  const id = Number(formData.get('id'));
  const status = String(formData.get('status') ?? '');
  const notes = String(formData.get('notes') ?? '').slice(0, 5000);
  updateSubmission(id, {
    ...(submissionStatuses.includes(status as SubmissionStatus) ? { status: status as SubmissionStatus } : {}),
    notes: notes || null,
  });
  revalidatePath('/admin', 'layout');
  redirect(`/admin/submissions/${id}?saved=1`);
}

export async function deleteSubmissionAction(formData: FormData) {
  await requireUser('admin');
  const row = deleteSubmission(Number(formData.get('id')));
  if (row?.path) await fs.rm(uploadAbsolutePath(row.path), { force: true }).catch(() => null);
  revalidatePath('/admin', 'layout');
  redirect('/admin/submissions?deleted=1');
}
