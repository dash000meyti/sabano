import fs from 'node:fs/promises';
import path from 'node:path';
import { BACKUPS_DIR } from '@sabano/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const user = await getSessionUser();
  if (user?.role !== 'admin') return new Response('Unauthorized', { status: 401 });
  const name = decodeURIComponent((await params).name);
  if (!/^sabano-[\w-]+\.db$/.test(name)) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(path.join(BACKUPS_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': 'application/vnd.sqlite3', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
