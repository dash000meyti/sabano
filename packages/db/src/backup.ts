import fs from 'node:fs';
import path from 'node:path';
import { getDb } from './client';
import { BACKUPS_DIR, ensureDataDirs } from './paths';

/** Writes a consistent snapshot of the live database and prunes old ones. */
export async function backupDatabase(keep = 14): Promise<string> {
  ensureDataDirs();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(BACKUPS_DIR, `sabano-${stamp}.db`);
  await getDb().$client.backup(target);
  const files = fs
    .readdirSync(BACKUPS_DIR)
    .filter((f) => f.startsWith('sabano-') && f.endsWith('.db'))
    .sort();
  for (const old of files.slice(0, Math.max(0, files.length - keep))) {
    fs.rmSync(path.join(BACKUPS_DIR, old), { force: true });
  }
  return target;
}

export function listBackups() {
  ensureDataDirs();
  return fs
    .readdirSync(BACKUPS_DIR)
    .filter((f) => f.endsWith('.db'))
    .sort()
    .reverse()
    .map((name) => {
      const stat = fs.statSync(path.join(BACKUPS_DIR, name));
      return { name, size: stat.size, createdAt: stat.mtime };
    });
}
