import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';

const secret = () => process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me';

export function hmac(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

/**
 * One-way, keyed hash of the client IP (never store raw IPs).
 *
 * The container only listens on 127.0.0.1 behind nginx, so trust what nginx saw:
 * `X-Real-IP` ($remote_addr), else the LAST `X-Forwarded-For` hop (appended by
 * nginx). The first X-Forwarded-For entry is whatever the visitor sent, so using
 * it would let bots dodge the rate limits by inventing addresses.
 */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const hops = h.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean);
  const ip = h.get('x-real-ip')?.trim() || hops?.at(-1) || 'unknown';
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
