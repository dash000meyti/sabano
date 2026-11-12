import fs from 'node:fs';
import path from 'node:path';

function findRepoRoot(start: string): string | null {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const repoRoot = findRepoRoot(process.cwd());

/** Root folder for everything persistent: db, uploads, media, backups */
export const DATA_DIR = path.resolve(
  process.env.DATA_DIR ?? (repoRoot ? path.join(repoRoot, 'data') : path.join(process.cwd(), 'data')),
);
export const DATABASE_PATH = path.resolve(process.env.DATABASE_PATH ?? path.join(DATA_DIR, 'sabano.db'));
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
export const MEDIA_DIR = path.join(DATA_DIR, 'media');
export const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
export const MIGRATIONS_DIR = path.resolve(
  process.env.MIGRATIONS_DIR ??
    (repoRoot ? path.join(repoRoot, 'packages/db/migrations') : path.join(process.cwd(), 'migrations')),
);

export function ensureDataDirs() {
  for (const dir of [DATA_DIR, UPLOADS_DIR, MEDIA_DIR, BACKUPS_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
