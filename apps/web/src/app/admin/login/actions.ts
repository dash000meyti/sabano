'use server';

import { redirect } from 'next/navigation';
import { findUserByEmail, verifyPassword } from '@sabano/db/users';
import { updateUser } from '@sabano/db/admin';
import { startSession } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { clientIpHash } from '@/lib/security';

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const ip = await clientIpHash();
  if (!rateLimit(`login:${ip}`, 10, 15 * 60) || !rateLimit(`login-email:${email}`, 8, 15 * 60)) {
    return { error: 'تعداد تلاش‌ها زیاد است. ۱۵ دقیقهٔ دیگر دوباره امتحان کنید.', email };
  }
  const user = email ? findUserByEmail(email) : undefined;
  // Always run a hash comparison to keep timing similar for unknown users.
  const ok = await verifyPassword(password, user?.passwordHash ?? 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA');
  if (!user || !ok) return { error: 'ایمیل یا رمز عبور درست نیست.', email };
  updateUser(user.id, { lastLoginAt: new Date() });
  await startSession(user.id);
  const next = String(formData.get('next') ?? '');
  redirect(next.startsWith('/admin') ? next : '/admin');
}
