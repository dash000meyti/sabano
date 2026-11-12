import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';

const secret = () => process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me';

export function hmac(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

/** One-way, keyed hash of the client IP (never store raw IPs). */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  return hmac(`ip:${ip}`).slice(0, 32);
}

export async function userAgent(): Promise<string> {
  return ((await headers()).get('user-agent') ?? '').slice(0, 300);
}

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function trackingCode(): string {
  const bytes = randomBytes(6);
  return 'SB-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
