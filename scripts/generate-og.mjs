// Renders 1200×630 Open Graph images for every page × locale with a real browser,
// so Persian text is shaped correctly. Output: apps/web/public/og/<locale>/<key>.jpg
// Usage: node scripts/generate-og.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const { chromium } = require('@playwright/test');

const root = path.resolve('.');
const web = path.join(root, 'apps/web');
const locales = ['fa', 'en', 'zh', 'ru', 'es'];
const msgs = Object.fromEntries(locales.map((l) => [l, JSON.parse(fs.readFileSync(path.join(root, `packages/i18n/messages/${l}.json`), 'utf8'))]));
const mimeOf = (p) => (p.endsWith('.woff2') ? 'font/woff2' : p.endsWith('.png') ? 'image/png' : 'image/jpeg');
const cache = new Map();
/** Inline assets as data URIs (about:blank pages cannot load file:// resources). */
const file = (p) => {
  if (!cache.has(p)) cache.set(p, `data:${mimeOf(p)};base64,${fs.readFileSync(path.join(web, 'public', p)).toString('base64')}`);
  return cache.get(p);
};

const pages = (m) => [
  ['home', m.home.hero.title1 + ' ' + m.home.hero.title2, m.home.hero.intro, '/images/hero/tehran.jpg'],
  ['about', m.about.hero.title, m.about.meta.description, '/images/about/office.jpg'],
  ['leadership', m.leadership.hero.title, m.leadership.meta.description, '/images/about/office.jpg'],
  ['services', m.services.hero.title, m.services.meta.description, '/images/topics/digital.jpg'],
  ...['guarantee', 'credit', 'investment', 'fund-agency', 'consulting'].map((s) => [`service-${s}`, m.services.items[s].title, m.services.items[s].short, '/images/topics/fintech.jpg']),
  ['investment', m.investment.hero.title, m.investment.meta.description, '/images/topics/future.jpg'],
  ['process', m.process.hero.title, m.process.meta.description, '/images/topics/ai.jpg'],
  ['portfolio', m.portfolio.hero.title, m.portfolio.meta.description, '/images/topics/future.jpg'],
  ['news', m.news.hero.title, m.news.meta.description, '/images/topics/ai.jpg'],
  ['faq', m.faq.hero.title, m.faq.meta.description, '/images/topics/digital.jpg'],
  ['cooperation', m.cooperation.hero.title, m.cooperation.meta.description, '/images/hero/tehran.jpg'],
  ['contact', m.contact.hero.title, m.contact.meta.description, '/images/about/office.jpg'],
  ['privacy', m.privacy.hero.title, m.privacy.meta.description, '/images/topics/digital.jpg'],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function html(locale, title, sub, bg) {
  const rtl = locale === 'fa';
  const m = msgs[locale];
  const font = rtl ? "'Vazirmatn','Manrope'" : locale === 'zh' ? "'Manrope','PingFang SC','Hiragino Sans GB','Noto Sans SC',sans-serif" : "'Manrope'";
  return `<!doctype html><html lang="${locale}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:'Vazirmatn';src:url('${file('/fonts/vazirmatn-nl-v33.woff2')}') format('woff2');font-weight:100 900;unicode-range:U+0600-06FF,U+200C-200F,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:'Manrope';src:url('${file('/fonts/manrope-latin-v5.woff2')}') format('woff2');font-weight:200 800}
@font-face{font-family:'Manrope';src:url('${file('/fonts/manrope-cyrillic-v5.woff2')}') format('woff2');font-weight:200 800;unicode-range:U+0400-045F}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:#03152b}
body{font-family:${font},sans-serif;color:#fff}
.frame{position:fixed;left:0;top:0;width:1200px;height:630px;overflow:hidden}
.bg{position:absolute;inset:0;background:url('${file(bg)}') center/cover;opacity:.45}
.shade{position:absolute;inset:0;background:linear-gradient(${rtl ? '270deg' : '90deg'},#03152b 0%,rgba(3,21,43,.92) 45%,rgba(3,21,43,.35) 100%)}
.glow{position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(0,170,169,.35),transparent 65%);${rtl ? 'left' : 'right'}:-120px;top:-160px}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.10) 1px,transparent 1px);background-size:22px 22px}
.wrap{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px}
.mark{width:64px;height:64px;border-radius:18px;background:#fff;display:grid;place-items:center}
.mark img{width:48px}
.bn{font-size:30px;font-weight:800;line-height:1}
.bs{font-size:16px;color:rgba(255,255,255,.65);margin-top:6px}
.kicker{margin-top:auto;font-size:20px;font-weight:700;color:#56c9c8;display:flex;align-items:center;gap:12px}
.kicker:before{content:'';width:36px;height:2px;background:linear-gradient(90deg,#eab543,#1bb6b5)}
h1{margin-top:14px;font-size:${title.length > 38 ? 54 : 64}px;font-weight:900;line-height:${rtl ? 1.45 : 1.12};max-width:900px;background:linear-gradient(100deg,#fff 0%,#fff 55%,#f0c86a 100%);-webkit-background-clip:text;color:transparent}
p{margin-top:18px;font-size:24px;line-height:${rtl ? 1.8 : 1.5};color:rgba(255,255,255,.78);max-width:860px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bar{position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,#00aaa9,#eab543,#00aaa9)}
.url{position:absolute;${rtl ? 'left' : 'right'}:72px;top:76px;font-size:20px;font-weight:700;color:rgba(255,255,255,.7);direction:ltr;font-family:'Manrope'}
</style></head><body>
<div class="frame"><div class="bg"></div><div class="shade"></div><div class="glow"></div><div class="dots"></div>
<div class="wrap">
<div class="brand"><div class="mark"><img src="${file('/images/brand/sabano-mark.png')}"></div><div><div class="bn">${esc(m.common.siteName)}</div><div class="bs">${esc(m.common.brandSub)}</div></div></div>
<div class="kicker">${esc(m.common.orgShort)}</div>
<h1>${esc(title)}</h1>
<p>${esc(sub)}</p>
</div>
<div class="url">sabano.ir</div>
<div class="bar"></div></div>
</body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let n = 0;
for (const locale of locales) {
  const dir = path.join(web, 'public/og', locale);
  fs.mkdirSync(dir, { recursive: true });
  for (const [key, title, sub, bg] of pages(msgs[locale])) {
    await page.setContent(html(locale, title, sub, bg), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(dir, `${key}.jpg`), type: 'jpeg', quality: 86 });
    n++;
  }
}
await browser.close();
console.log(`Generated ${n} OG images.`);
