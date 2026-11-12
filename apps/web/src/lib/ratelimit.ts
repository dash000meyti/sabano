import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { getDb, rateLimits } from '@sabano/db';

/** Fixed-window limiter stored in SQLite. Returns true when the call is allowed. */
export function rateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  return db.transaction((tx) => {
    const row = tx.select().from(rateLimits).where(eq(rateLimits.key, key)).get();
    if (!row || row.resetAt <= now) {
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
