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
  const words = title.split(/\s+/);
  const cut = Math.max(1, words.length - (words.length > 3 ? 2 : 1));
  const head = esc(words.slice(0, cut).join(' '));
  const tail = esc(words.slice(cut).join(' '));
  const side = rtl ? 'left' : 'right';
  const rings = [250, 200, 150, 100]
    .map((r, i) => `<circle cx="300" cy="300" r="${r}" fill="none" stroke="url(#g)" stroke-width="1" ${i === 0 ? 'stroke-dasharray="2 9"' : ''}/><circle cx="${300 + r * Math.cos(i * 1.3)}" cy="${300 + r * Math.sin(i * 1.3)}" r="${i % 2 ? 5 : 3.5}" fill="${i % 2 ? '#eab543' : '#2fe3d2'}"/>`)
    .join('');
  return `<!doctype html><html lang="${locale}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:'Vazirmatn';src:url('${file('/fonts/vazirmatn-nl-v33.woff2')}') format('woff2');font-weight:100 900;unicode-range:U+0600-06FF,U+200C-200F,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:'Manrope';src:url('${file('/fonts/manrope-latin-v5.woff2')}') format('woff2');font-weight:200 800}
@font-face{font-family:'Manrope';src:url('${file('/fonts/manrope-cyrillic-v5.woff2')}') format('woff2');font-weight:200 800;unicode-range:U+0400-045F}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:#020a18}
body{font-family:${font},sans-serif;color:#fff}
.frame{position:fixed;left:0;top:0;width:1200px;height:630px;overflow:hidden;background:radial-gradient(120% 80% at 50% -20%,#0f3157,transparent 60%),linear-gradient(180deg,#04122a,#020a18 70%)}
.bg{position:absolute;inset:0 ${rtl ? '50%' : '0'} 0 ${rtl ? '0' : '50%'};background:url('${file(bg)}') center/cover;opacity:.35;filter:saturate(.6);mix-blend-mode:luminosity}
.fade{position:absolute;inset:0;background:linear-gradient(${rtl ? '90deg' : '270deg'},transparent 0%,#020a18 52%)}
.a1{position:absolute;width:760px;height:620px;${side === 'left' ? 'right' : 'left'}:-180px;top:-260px;border-radius:50%;background:radial-gradient(closest-side,rgb(0 170 169/.5),transparent)}
.a2{position:absolute;width:640px;height:520px;${side}:-120px;bottom:-280px;border-radius:50%;background:radial-gradient(closest-side,rgb(234 181 67/.28),transparent)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgb(255 255 255/.05) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255/.05) 1px,transparent 1px);background-size:60px 60px;-webkit-mask-image:radial-gradient(70% 70% at 50% 40%,#000,transparent 80%)}
.rings{position:absolute;${side}:-140px;top:15px;width:600px;height:600px;opacity:.55}
.wrap{position:absolute;inset:0;padding:60px 72px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px}
.mark{width:62px;height:62px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 0 0 5px rgb(255 255 255/.06),0 10px 30px -6px rgb(47 227 210/.6)}
.mark img{width:44px}
.bn{font-size:30px;font-weight:900;line-height:1}
.bs{font-size:16px;color:rgb(255 255 255/.55);margin-top:6px}
.kicker{margin-top:auto;align-self:flex-start;display:flex;align-items:center;gap:10px;padding:8px 18px 8px 10px;border-radius:999px;border:1px solid rgb(255 255 255/.14);background:rgb(255 255 255/.06);font-size:18px;font-weight:700;color:#6ff5e6}
.kicker i{width:10px;height:10px;border-radius:50%;background:#2fe3d2;box-shadow:0 0 12px 3px rgb(47 227 210/.7)}
h1{margin-top:20px;font-size:${title.length > 34 ? 56 : 68}px;font-weight:900;line-height:${rtl ? 1.45 : 1.08};max-width:880px}
h1 .w{background:linear-gradient(180deg,#fff 30%,rgb(255 255 255/.7));-webkit-background-clip:text;color:transparent}
h1 .g{background:linear-gradient(100deg,#f7dfa8,#eab543 45%,#fff1c7 60%,#eab543);-webkit-background-clip:text;color:transparent}
p{margin-top:18px;font-size:23px;line-height:${rtl ? 1.8 : 1.5};color:rgb(255 255 255/.7);max-width:820px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bar{position:absolute;left:0;right:0;bottom:0;height:5px;background:linear-gradient(90deg,#2fe3d2,#eab543,#2fe3d2)}
.url{position:absolute;${side}:72px;top:78px;font-size:19px;font-weight:700;color:rgb(255 255 255/.65);direction:ltr;font-family:'Manrope'}
</style></head><body>
<div class="frame"><div class="bg"></div><div class="fade"></div><div class="a1"></div><div class="a2"></div><div class="grid"></div>
<svg class="rings" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2fe3d2" stop-opacity=".7"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#eab543" stop-opacity=".6"/></linearGradient></defs>${rings}</svg>
<div class="wrap">
<div class="brand"><div class="mark"><img src="${file('/images/brand/sabano-mark.png')}"></div><div><div class="bn">${esc(m.common.siteName)}</div><div class="bs">${esc(m.common.brandSub)}</div></div></div>
<div class="kicker"><i></i>${esc(m.common.orgShort)}</div>
<h1><span class="w">${head}</span> <span class="g">${tail}</span></h1>
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
