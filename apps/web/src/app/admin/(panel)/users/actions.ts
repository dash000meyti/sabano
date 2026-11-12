'use server';

import { redirect } from 'next/navigation';
import { deleteUser, deleteUserSessions, getUser, updateUser } from '@sabano/db/admin';
import { createUser, hashPassword } from '@sabano/db/users';
import { requireUser } from '@/lib/auth';

export async function createUserAction(formData: FormData) {
  await requireUser('admin');
  try {
    await createUser({
      email: String(formData.get('email') ?? ''),
      name: String(formData.get('name') ?? ''),
      password: String(formData.get('password') ?? ''),
      role: formData.get('role') === 'admin' ? 'admin' : 'editor',
    });
  } catch (err) {
    const msg = err instanceof Error && /UNIQUE/i.test(err.message) ? 'این ایمیل قبلاً ثبت شده است.' : err instanceof Error && /10/.test(err.message) ? 'رمز عبور باید حداقل ۱۰ نویسه باشد.' : 'ایمیل یا اطلاعات وارد‌شده معتبر نیست.';
    redirect(`/admin/users?error=${encodeURIComponent(msg)}`);
  }
  redirect('/admin/users?saved=1');
}

export async function resetPasswordAction(formData: FormData) {
  const me = await requireUser();
  const id = Number(formData.get('id'));
  if (me.role !== 'admin' && me.id !== id) redirect('/admin?denied=1');
  const password = String(formData.get('password') ?? '');
  if (password.length < 10) redirect(`/admin/users?error=${encodeURIComponent('رمز عبور باید حداقل ۱۰ نویسه باشد.')}`);
  updateUser(id, { passwordHash: await hashPassword(password) });
  if (me.id !== id) deleteUserSessions(id);
  redirect('/admin/users?saved=1');
}

export async function deleteUserAction(formData: FormData) {
  const me = await requireUser('admin');
  const id = Number(formData.get('id'));
  if (id === me.id) redirect(`/admin/users?error=${encodeURIComponent('نمی‌توانید حساب خودتان را حذف کنید.')}`);
  if (getUser(id)) deleteUser(id);
  redirect('/admin/users?saved=1');
}
