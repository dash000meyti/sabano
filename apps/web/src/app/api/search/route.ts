import { isLocale } from '@sabano/i18n';
import { searchSite } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale');
  const q = (url.searchParams.get('q') ?? '').slice(0, 100);
  if (!isLocale(locale)) return Response.json({ hits: [] }, { status: 400 });
  const hits = await searchSite(locale, q);
  return Response.json({ hits }, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
