import { getDb } from '@sabano/db';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    getDb().$client.prepare('select 1').get();
    return Response.json({ ok: true, time: new Date().toISOString() });
  } catch (err) {
    console.error('[sabano] Health check failed', err); // details stay in the server log
    return Response.json({ ok: false }, { status: 503 });
  }
}
