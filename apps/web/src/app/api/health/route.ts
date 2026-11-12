import { getDb } from '@sabano/db';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    getDb().$client.prepare('select 1').get();
    return Response.json({ ok: true, time: new Date().toISOString() });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 503 });
  }
}
