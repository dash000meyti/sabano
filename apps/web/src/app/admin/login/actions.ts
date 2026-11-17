'use server';

import { redirect } from 'next/navigation';
import { findUserByEmail, verifyPassword } from '@sabano/db/users';
import { updateUser } from '@sabano/db/admin';
import { startSession } from '@/lib/auth';
import { isLimited, rateLimit } from '@/lib/ratelimit';
import { clientIpHash, hmac } from '@/lib/security';

export type LoginState = { error?: string; email?: string };

const WINDOW = 15 * 60;
const tooMany = 'تعداد تلاش‌ها زیاد است. ۱۵ دقیقهٔ دیگر دوباره امتحان کنید.';

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  // Bounded input: emails are ≤254 chars; long passwords only waste hashing time.
  const email = String(formData.get('email') ?? '').trim().toLowerCase().slice(0, 254);
  const password = String(formData.get('password') ?? '').slice(0, 256);
  const ip = await clientIpHash();
  const emailKey = hmac(`email:${email}`).slice(0, 32); // fixed-size keys, no raw emails stored

  // Every attempt counts per IP; for an email only FAILED attempts count, and the tight
  // per-(email, IP) limit means someone elsewhere can't lock the real admin out. The
  // looser per-email cap still stops a distributed guess at one account.
  if (!rateLimit(`login:${ip}`, 10, WINDOW) || isLimited(`login-fail:${emailKey}:${ip}`, 6) || isLimited(`login-fail:${emailKey}`, 40)) {
    return { error: tooMany, email };
  }
  const user = email ? findUserByEmail(email) : undefined;
  // Always run a hash comparison to keep timing similar for unknown users.
  const ok = await verifyPassword(password, user?.passwordHash ?? 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA');
  if (!user || !ok) {
    rateLimit(`login-fail:${emailKey}:${ip}`, Number.MAX_SAFE_INTEGER, WINDOW);
    rateLimit(`login-fail:${emailKey}`, Number.MAX_SAFE_INTEGER, WINDOW);
    return { error: 'ایمیل یا رمز عبور درست نیست.', email };
  }
  updateUser(user.id, { lastLoginAt: new Date() });
  await startSession(user.id);
  const next = String(formData.get('next') ?? '');
  redirect(next.startsWith('/admin') ? next : '/admin');
}
