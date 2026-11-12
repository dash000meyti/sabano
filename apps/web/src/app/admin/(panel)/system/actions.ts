'use server';

import { redirect } from 'next/navigation';
import { backupDatabase } from '@sabano/db';
import { requireUser } from '@/lib/auth';
import { revalidateSite } from '@/lib/revalidate';

export async function backupNowAction() {
  await requireUser('admin');
  await backupDatabase();
  redirect('/admin/system?saved=backup');
}

export async function purgeCacheAction() {
  await requireUser('admin');
  revalidateSite();
  redirect('/admin/system?saved=cache');
}
