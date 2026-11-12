import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { count, eq } from 'drizzle-orm';
import { getDb } from './client';
import { users } from './schema';

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

const PARAMS = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, saltB64, keyB64] = stored.split('$');
  if (algo !== 'scrypt' || !n || !r || !p || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const key = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: PARAMS.maxmem,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'editor';
}) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
  if (input.password.length < 10) throw new Error('Password must be at least 10 characters');
  const passwordHash = await hashPassword(input.password);
  return getDb()
    .insert(users)
    .values({ email, name: input.name.trim(), passwordHash, role: input.role ?? 'editor' })
    .returning()
    .get();
}

export function countUsers(): number {
  return getDb().select({ n: count() }).from(users).get()?.n ?? 0;
}

export function findUserByEmail(email: string) {
  return getDb().select().from(users).where(eq(users.email, email.trim().toLowerCase())).get();
}
