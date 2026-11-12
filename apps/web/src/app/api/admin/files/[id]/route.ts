import fs from 'node:fs/promises';
import { getSubmission } from '@sabano/db/admin';
import { getSessionUser } from '@/lib/auth';
import { uploadAbsolutePath } from '@/lib/uploads';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUser())) return new Response('Unauthorized', { status: 401 });
  const s = getSubmission(Number((await params).id));
  if (!s?.attachmentPath) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(uploadAbsolutePath(s.attachmentPath));
    const name = encodeURIComponent(s.attachmentName ?? 'attachment');
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': s.attachmentMime ?? 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${name}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
