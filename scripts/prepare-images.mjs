// Converts the original sabano.ir assets into web-ready sources under apps/web/public/images.
// Usage: node scripts/prepare-images.mjs <source-dir>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const sharp = require('sharp');

const src = path.resolve(process.argv[2] ?? '');
if (!fs.existsSync(src)) throw new Error(`Source dir not found: ${src}`);
const out = path.resolve('apps/web/public/images');
const p = (...x) => path.join(out, ...x);
for (const d of ['hero', 'about', 'topics', 'people', 'partners', 'brand', 'social']) fs.mkdirSync(p(d), { recursive: true });

const jpg = { quality: 84, mozjpeg: true, progressive: true };

await sharp(path.join(src, 'hero-tehran.png')).jpeg(jpg).toFile(p('hero', 'tehran.jpg'));
await sharp(path.join(src, 'office-tehran.png')).jpeg(jpg).toFile(p('about', 'office.jpg'));
await sharp(path.join(src, 'future-tech.png')).jpeg(jpg).toFile(p('topics', 'future.jpg'));

// The triptych holds three topic images side by side: AI | fintech | digital infrastructure
const tri = sharp(path.join(src, 'topics-triptych.png'));
const { width: tw = 0, height: th = 0 } = await tri.metadata();
const third = Math.floor(tw / 3);
const names = ['ai', 'fintech', 'digital'];
for (let i = 0; i < 3; i++) {
  await sharp(path.join(src, 'topics-triptych.png'))
    .extract({ left: i * third, top: 0, width: third, height: th })
    .jpeg(jpg)
    .toFile(p('topics', `${names[i]}.jpg`));
}

// Portraits: square crops centred on the face
async function square(file, outName, centerX) {
  const img = sharp(path.join(src, file));
  const { width = 0, height = 0 } = await img.metadata();
  const size = Math.min(width, height);
  const left = Math.max(0, Math.min(width - size, Math.round(centerX * width - size / 2)));
  await sharp(path.join(src, file))
    .flatten({ background: '#ffffff' })
    .extract({ left, top: 0, width: size, height: size })
    .resize(800, 800, { fit: 'cover' })
    .jpeg(jpg)
    .toFile(p('people', outName));
}
await square('hamed-sedaghat.jpg', 'mehdi-sedaghat.jpg', 0.5);
await square('mohammadreza-nazari.png', 'mohammadreza-nazari.jpg', 0.5);
await square('akbar-ghanbarpour.jpg', 'akbar-ghanbarpour.jpg', 0.45);

// Logos of related institutions (normalised to PNG, max 600px)
const logo = (file, outName) =>
  sharp(path.join(src, file)).resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true }).png().toFile(p('partners', outName));
await logo('partner-inif.png', 'inif.png');
await logo('partner-science-vice-presidency.jpg', 'science-vice-presidency.png');
await logo('secretariat-working-group.png', 'rtfunds-secretariat.png');
await logo('partner-irvc.jpg', 'irvc.png');

// Brand mark (temporary until the official vector logo arrives)
await sharp(path.join(src, 'sabano-mark-light.png')).trim().resize({ width: 640, withoutEnlargement: true }).png().toFile(p('brand', 'sabano-mark.png'));
await sharp(path.join(src, 'bale-logo.png')).resize(128, 128).png().toFile(p('social', 'bale.png'));

console.log('Images written to', out);
