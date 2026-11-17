import 'server-only';
import { eq, lte, sql } from 'drizzle-orm';
import { getDb, rateLimits } from '@sabano/db';

/** Drops expired windows so the table can't grow without bound. Cheap; called on writes and daily. */
export function purgeRateLimits() {
  getDb().delete(rateLimits).where(lte(rateLimits.resetAt, Math.floor(Date.now() / 1000))).run();
}

/** Read-only check: is this key currently over its limit? (doesn't count an attempt) */
export function isLimited(key: string, limit: number): boolean {
  const row = getDb().select().from(rateLimits).where(eq(rateLimits.key, key)).get();
  return !!row && row.resetAt > Math.floor(Date.now() / 1000) && row.count >= limit;
}

/** Fixed-window limiter stored in SQLite. Returns true when the call is allowed. */
export function rateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  return db.transaction((tx) => {
    const row = tx.select().from(rateLimits).where(eq(rateLimits.key, key)).get();
    if (!row || row.resetAt <= now) {
      if (Math.random() < 0.02) tx.delete(rateLimits).where(lte(rateLimits.resetAt, now)).run();
      tx.insert(rateLimits)
        .values({ key, count: 1, resetAt: now + windowSeconds })
        .onConflictDoUpdate({ target: rateLimits.key, set: { count: 1, resetAt: now + windowSeconds } })
        .run();
      return true;
    }
    if (row.count >= limit) return false;
    tx.update(rateLimits).set({ count: sql`${rateLimits.count} + 1` }).where(eq(rateLimits.key, key)).run();
    return true;
  });
}
