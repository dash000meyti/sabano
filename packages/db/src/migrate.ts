import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb } from './client';
import { MIGRATIONS_DIR } from './paths';

export function runMigrations() {
  migrate(getDb(), { migrationsFolder: MIGRATIONS_DIR });
}
