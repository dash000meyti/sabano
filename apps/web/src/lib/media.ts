import 'server-only';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { MEDIA_DIR } from '@sabano/db';
import { insertMedia } from '@sabano/db/admin';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(['jpeg', 'png', 'webp', 'gif']);

/** Stores an uploaded image (re-encoded, metadata stripped, max 2400px wide) and returns its public path. */
export async function storeImage(file: File, alt?: string) {
  if (file.size === 0) throw new Error('فایلی انتخاب نشده است.');
  if (file.size > MAX_BYTES) throw new Error('حجم تصویر بیش از ۱۰ مگابایت است.');
  const input = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(input).metadata().catch(() => null);
  if (!meta?.format || !ALLOWED.has(meta.format)) throw new Error('فقط تصاویر JPG، PNG، WebP و GIF پذیرفته می‌شوند.');
  // Keep what the format can carry: PNG stays PNG; WebP and GIF become WebP (keeps
  // transparency and animation, which JPEG would flatten into black / a frame strip).
  const animated = meta.format === 'gif' || meta.format === 'webp';
  const pipeline = sharp(input, { animated }).rotate().resize({ width: 2400, withoutEnlargement: true });
  const target = meta.format === 'png' ? 'png' : meta.format === 'jpeg' ? 'jpeg' : 'webp';
  const out =
    target === 'png'
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
      : target === 'webp'
        ? await pipeline.webp({ quality: 86 }).toBuffer({ resolveWithObject: true })
        : await pipeline.jpeg({ quality: 86, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const ext = target === 'jpeg' ? 'jpg' : target;
  const mime = `image/${target}`;
  // For animations sharp reports the whole frame strip; store one frame's height.
  const height = Math.round(out.info.height / Math.max(1, (animated && meta.pages) || 1));
  const now = new Date();
  const dir = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const base = path.basename(file.name, path.extname(file.name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
  const rel = `${dir}/${base}-${randomBytes(4).toString('hex')}.${ext}`;
  await fs.mkdir(path.join(MEDIA_DIR, dir), { recursive: true });
  await fs.writeFile(path.join(MEDIA_DIR, rel), out.data);
  const row = insertMedia({ path: rel, originalName: file.name.slice(0, 200), mime, size: out.data.length, width: out.info.width, height, alt: alt ?? null });
  return { ...row, url: `/media/${rel}` };
}

export function mediaAbsolutePath(rel: string) {
  const abs = path.resolve(MEDIA_DIR, rel);
  if (!abs.startsWith(path.resolve(MEDIA_DIR) + path.sep)) throw new Error('Invalid path');
  return abs;
}
