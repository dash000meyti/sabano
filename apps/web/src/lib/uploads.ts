import 'server-only';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOADS_DIR } from '@sabano/db';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

type Kind = { ext: string; mime: string };

/** Identifies an upload by its magic bytes (never trust the extension or client MIME type). */
export function sniff(buf: Buffer, originalName: string): Kind | null {
  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  const startsWith = (...bytes: number[]) => bytes.every((b, i) => buf[i] === b);
  if (startsWith(0x25, 0x50, 0x44, 0x46)) return { ext: 'pdf', mime: 'application/pdf' };
  if (startsWith(0x89, 0x50, 0x4e, 0x47)) return { ext: 'png', mime: 'image/png' };
  if (startsWith(0xff, 0xd8, 0xff)) return { ext: 'jpg', mime: 'image/jpeg' };
  // OOXML (docx/xlsx/pptx) are ZIP containers
  if (startsWith(0x50, 0x4b, 0x03, 0x04)) {
    const map: Record<string, string> = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    return map[ext] ? { ext, mime: map[ext]! } : null;
  }
  // Legacy Office (doc/xls/ppt) use the OLE2 compound format
  if (startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) {
    const map: Record<string, string> = { doc: 'application/msword', xls: 'application/vnd.ms-excel', ppt: 'application/vnd.ms-powerpoint' };
    return map[ext] ? { ext, mime: map[ext]! } : null;
  }
  return null;
}

export type SavedFile = { name: string; relPath: string; mime: string; size: number };

export async function saveUpload(file: File): Promise<SavedFile | { error: 'fileSize' | 'fileType' }> {
  if (file.size > MAX_UPLOAD_BYTES) return { error: 'fileSize' };
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buf, file.name);
  if (!kind) return { error: 'fileType' };
  const now = new Date();
  const dir = path.join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, '0'));
  const relPath = path.join(dir, `${randomBytes(16).toString('hex')}.${kind.ext}`);
  await fs.mkdir(path.join(UPLOADS_DIR, dir), { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, relPath), buf, { mode: 0o640 });
  const safeName = file.name.replace(/[\\/\0<>:"|?*]+/g, '_').slice(0, 160) || `attachment.${kind.ext}`;
  return { name: safeName, relPath, mime: kind.mime, size: buf.length };
}

export function uploadAbsolutePath(relPath: string): string {
  const abs = path.resolve(UPLOADS_DIR, relPath);
  if (!abs.startsWith(path.resolve(UPLOADS_DIR) + path.sep)) throw new Error('Invalid path');
  return abs;
}
