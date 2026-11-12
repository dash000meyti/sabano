import { buildLlmsTxt } from '@/lib/llms';

// Rendered per request (cheap SQLite reads) so builds never need a database.
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(await buildLlmsTxt(true), { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
