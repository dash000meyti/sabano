import { describe, expect, it } from 'vitest';
import { sniff } from '@/lib/uploads';

const b = (...bytes: number[]) => Buffer.from([...bytes, 0, 0, 0, 0]);

describe('upload sniffing by magic bytes', () => {
  it('detects PDF, PNG and JPEG regardless of name', () => {
    expect(sniff(b(0x25, 0x50, 0x44, 0x46), 'x.bin')?.ext).toBe('pdf');
    expect(sniff(b(0x89, 0x50, 0x4e, 0x47), 'x.pdf')?.ext).toBe('png');
    expect(sniff(b(0xff, 0xd8, 0xff), 'x')?.ext).toBe('jpg');
  });
  it('requires an Office extension for ZIP/OLE containers', () => {
    expect(sniff(b(0x50, 0x4b, 0x03, 0x04), 'plan.docx')?.ext).toBe('docx');
    expect(sniff(b(0x50, 0x4b, 0x03, 0x04), 'malware.zip')).toBeNull();
    expect(sniff(b(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1), 'old.xls')?.ext).toBe('xls');
  });
  it('rejects executables and scripts', () => {
    expect(sniff(Buffer.from('MZ\x90\x00'), 'setup.pdf')).toBeNull();
    expect(sniff(Buffer.from('<script>'), 'a.png')).toBeNull();
  });
});
