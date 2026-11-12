import 'server-only';
import { SITE_URL } from './site';

/** Notifies IndexNow (Bing, Yandex, Seznam, Naver…) of changed URLs. Production only. */
export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || process.env.NODE_ENV !== 'production' || urls.length === 0) return;
  try {
    const host = new URL(SITE_URL).host;
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `${SITE_URL}/indexnow-key.txt`, urlList: urls.slice(0, 10000) }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error('[sabano] IndexNow ping failed', err);
  }
}
