/**
 * Runs once when the Node.js server starts: applies DB migrations, seeds an empty
 * database with the fund's current content, bootstraps the first admin from env,
 * and schedules daily backups.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { runMigrations, seedDatabase, countUsers, createUser, backupDatabase, DATABASE_PATH } = await import('@sabano/db');

  runMigrations();
  if (seedDatabase()) console.log('[sabano] Seeded empty database at', DATABASE_PATH);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && countUsers() === 0) {
    await createUser({ email, password, name: process.env.ADMIN_NAME ?? 'مدیر سایت', role: 'admin' });
    console.log('[sabano] Created initial admin user', email);
  }

  if (process.env.NODE_ENV === 'production' && process.env.BACKUP_DISABLED !== '1') {
    const day = 24 * 60 * 60 * 1000;
    const run = () => backupDatabase().catch((err) => console.error('[sabano] Backup failed', err));
    setTimeout(run, 60_000);
    setInterval(run, day).unref();
  }
}
