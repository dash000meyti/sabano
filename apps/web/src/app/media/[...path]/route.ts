import fs from 'node:fs/promises';
import { mediaAbsolutePath } from '@/lib/media';

const types: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const rel = path.join('/');
  const ext = rel.split('.').pop()?.toLowerCase() ?? '';
  if (!types[ext]) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(mediaAbsolutePath(rel));
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': types[ext], 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
