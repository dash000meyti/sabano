import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createSessionRow, deleteSession, findSession, purgeExpiredSessions } from '@sabano/db/admin';
import { userAgent } from './security';

export const SESSION_COOKIE = 'sabano_admin';
const SESSION_DAYS = 7;

export type SessionUser = { id: number; email: string; name: string; role: 'admin' | 'editor' };

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function startSession(userId: number) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  createSessionRow(hashToken(token), userId, expires, await userAgent());
  purgeExpiredSessions();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) deleteSession(hashToken(token));
  jar.delete(SESSION_COOKIE);
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = findSession(hashToken(token));
  if (!row || row.session.expiresAt.getTime() < Date.now()) return null;
  return row.user;
});

/** Use at the top of every admin page and server action. */
export async function requireUser(role?: 'admin'): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (role === 'admin' && user.role !== 'admin') redirect('/admin?denied=1');
  return user;
}
