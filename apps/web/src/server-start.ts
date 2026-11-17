/**
 * Server start-up tasks (Node.js runtime only, loaded from instrumentation.ts):
 * make sure a strong secret exists, apply DB migrations, seed a brand-new
 * database with the fund's current content, bootstrap the first admin from env,
 * and schedule daily maintenance (backups + expired rate-limit cleanup).
 */
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { lte } from 'drizzle-orm';
import { backupDatabase, countUsers, createUser, DATA_DIR, DATABASE_PATH, ensureDataDirs, getDb, rateLimits, runMigrations, seedDatabase } from '@sabano/db';

export async function startServer() {
  ensureDataDirs();

  if (process.env.NODE_ENV === 'production') {
    // .env.example is public, so its placeholder must never become the real key.
    // Without a proper value, generate one once and keep it in the data volume.
    const secret = process.env.SESSION_SECRET ?? '';
    if (secret.length < 32 || /change-?me|example|placeholder/i.test(secret)) {
      const file = path.join(DATA_DIR, 'session-secret');
      let generated = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim() : '';
      if (generated.length < 32) {
        generated = randomBytes(32).toString('hex');
        fs.writeFileSync(file, generated, { mode: 0o600 });
      }
      process.env.SESSION_SECRET = generated;
      console.warn('[sabano] SESSION_SECRET is missing or a placeholder: using a generated secret stored in the data volume. Set your own in .env (openssl rand -hex 32).');
    }
    if (!process.env.SITE_URL) console.warn('[sabano] SITE_URL is not set; canonical URLs and the sitemap fall back to the default.');
  }

  runMigrations();
  try {
    if (seedDatabase()) console.log('[sabano] Seeded empty database at', DATABASE_PATH);
  } catch (err) {
    // Never let seeding keep the site from starting.
    console.error('[sabano] Seeding failed; continuing with the existing data', err);
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && countUsers() === 0) {
    // .env.example is public: never create an admin with a placeholder or published password.
    if (/change-?me|localdev/i.test(password) || password.length < 12) {
      console.error('[sabano] ADMIN_PASSWORD is a placeholder or shorter than 12 characters; the first admin was NOT created. Set a strong password in .env and restart.');
    } else {
      await createUser({ email, password, name: process.env.ADMIN_NAME ?? 'مدیر سایت', role: 'admin' });
      console.log('[sabano] Created initial admin user', email);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const day = 24 * 60 * 60 * 1000;
    const maintain = () => {
      try {
        getDb().delete(rateLimits).where(lte(rateLimits.resetAt, Math.floor(Date.now() / 1000))).run();
      } catch (err) {
        console.error('[sabano] Rate-limit cleanup failed', err);
      }
      if (process.env.BACKUP_DISABLED !== '1') backupDatabase().catch((err) => console.error('[sabano] Backup failed', err));
    };
    setTimeout(maintain, 60_000);
    setInterval(maintain, day).unref();
  }
}
