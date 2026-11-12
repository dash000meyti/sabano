import { allSubmissionsForExport } from '@sabano/db/admin';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const cell = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : String(v ?? '');
  // Neutralise spreadsheet formula injection and quote every field.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await getSessionUser())) return new Response('Unauthorized', { status: 401 });
  const rows = allSubmissionsForExport();
  const cols = ['code', 'createdAt', 'status', 'type', 'name', 'contact', 'company', 'website', 'locale', 'message', 'attachmentName', 'notes'] as const;
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sabano-submissions-${stamp}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
