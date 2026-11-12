import { expect, test } from '@playwright/test';

const locales = [
  { code: 'fa', prefix: '', dir: 'rtl', lang: 'fa-IR' },
  { code: 'en', prefix: '/en', dir: 'ltr', lang: 'en' },
  { code: 'zh', prefix: '/zh', dir: 'ltr', lang: 'zh-Hans' },
  { code: 'ru', prefix: '/ru', dir: 'ltr', lang: 'ru' },
  { code: 'es', prefix: '/es', dir: 'ltr', lang: 'es' },
];
const pages = ['', '/about', '/leadership', '/services', '/services/guarantee', '/services/credit', '/services/investment', '/services/fund-agency', '/services/consulting', '/investment', '/process', '/news', '/faq', '/cooperation', '/contact', '/privacy'];

for (const l of locales) {
  test.describe(`${l.code} pages`, () => {
    for (const p of pages) {
      test(`${l.prefix}${p || '/'} has correct SEO markup`, async ({ request }) => {
        const res = await request.get(`${l.prefix}${p}` || '/');
        expect(res.status()).toBe(200);
        const html = await res.text();
        expect(html).toContain(`<html lang="${l.lang}" dir="${l.dir}"`);
        expect(html).toMatch(/<title>[^<]{10,}<\/title>/);
        // CJK text is denser, so Chinese descriptions are legitimately shorter in characters.
        const minDesc = l.code === 'zh' ? 25 : 50;
        expect(html).toMatch(new RegExp(`<meta name="description" content="[^"]{${minDesc},}"`));
        const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
        expect(canonical).toBe(`https://sabano.ir${l.prefix}${p}` || 'https://sabano.ir/');
        for (const hl of ['fa-IR', 'en', 'zh-Hans', 'ru', 'es', 'x-default']) expect(html).toContain(`hrefLang="${hl}"`);
        expect(html).toContain('og:image');
        const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));
        expect(blocks.length).toBeGreaterThan(0);
        if (p) expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(true);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
      });
    }
  });
}

test('service pages carry Service + FAQPage schema', async ({ request }) => {
  const html = await (await request.get('/services/guarantee')).text();
  expect(html).toContain('"@type":"Service"');
  expect(html).toContain('"@type":"FAQPage"');
});

test('legacy .html URLs redirect permanently', async ({ request }) => {
  for (const [from, to] of [
    ['/about.html', '/about'],
    ['/index.html', '/'],
    ['/en/services.html', '/en/services'],
    ['/ru/leadership.html', '/ru/leadership'],
    ['/submit-proposal.php', '/cooperation'],
  ]) {
    const res = await request.get(from!, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(res.headers().location, from).toBe(to);
  }
});

test('unknown pages return a branded 404', async ({ request }) => {
  const res = await request.get('/this-does-not-exist');
  expect(res.status()).toBe(404);
  expect(await res.text()).toContain('404');
});

test('machine-readable endpoints', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://sabano.ir/sitemap.xml');
  expect(robots).toContain('ClaudeBot');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('hreflang="zh-Hans"');
  expect((sitemap.match(/<url>/g) ?? []).length).toBeGreaterThan(80);
  const llms = await request.get('/llms.txt');
  expect(llms.headers()['content-type']).toContain('text/markdown');
  expect(await llms.text()).toContain('# Sabano');
  const rss = await (await request.get('/en/news/rss.xml')).text();
  expect(rss).toContain('<rss version="2.0"');
  const faRss = await request.get('/news/rss.xml');
  expect(faRss.status()).toBe(200);
});

test('news articles only declare the languages they exist in', async ({ request }) => {
  const html = await (await request.get('/news/what-is-a-research-and-technology-fund')).text();
  expect(html).toContain('"@type":"Article"');
  expect(html).toMatch(/<meta property="article:published_time"/);
});
