import { describe, expect, it } from 'vitest';
import { asciiDigits, isValidContact } from '@/lib/contact';
import { normalizeWebsite, submissionSchema } from '@/lib/validation';

describe('contact validation', () => {
  it('accepts e-mail and phone numbers in Persian or Latin digits', () => {
    expect(isValidContact('info@sabano.ir')).toBe(true);
    expect(isValidContact('09123456789')).toBe(true);
    expect(isValidContact('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true);
    expect(isValidContact('+98 21 8851 7259')).toBe(true);
  });
  it('rejects junk', () => {
    expect(isValidContact('hello')).toBe(false);
    expect(isValidContact('123')).toBe(false);
    expect(isValidContact('a@b')).toBe(false);
  });
  it('converts Persian and Arabic digits', () => {
    expect(asciiDigits('۱۲۳٤٥')).toBe('12345');
  });
});

describe('website normalisation', () => {
  it('adds a scheme and validates the host', () => {
    expect(normalizeWebsite('example.com')).toBe('https://example.com/');
    expect(normalizeWebsite('http://a.io/x')).toBe('http://a.io/x');
    expect(normalizeWebsite('not a url')).toBeNull();
    expect(normalizeWebsite('')).toBeNull();
  });
});

describe('submission schema', () => {
  const ok = { type: 'investment', name: 'Test', contact: 'a@b.co', message: 'x'.repeat(25), consent: 'on' };
  it('accepts a valid submission', () => {
    expect(submissionSchema.safeParse(ok).success).toBe(true);
  });
  it('returns message keys as errors', () => {
    const r = submissionSchema.safeParse({ ...ok, type: 'nope', message: 'short', consent: '' });
    expect(r.success).toBe(false);
    const msgs = r.success ? [] : r.error.issues.map((i) => i.message);
    expect(msgs).toEqual(expect.arrayContaining(['type', 'tooShort', 'consent']));
  });
});
