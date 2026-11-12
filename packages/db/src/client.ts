import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { DATABASE_PATH, ensureDataDirs } from './paths';

export type DB = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const globalForDb = globalThis as unknown as { __sabanoDb?: DB };

/** Lazily opened singleton connection (safe across Next.js dev reloads). */
export function getDb(): DB {
  if (!globalForDb.__sabanoDb) {
    ensureDataDirs();
    const sqlite = new Database(DATABASE_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('synchronous = NORMAL');
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('busy_timeout = 5000');
    globalForDb.__sabanoDb = drizzle(sqlite, { schema }) as DB;
  }
  return globalForDb.__sabanoDb;
}
