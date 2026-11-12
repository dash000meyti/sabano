'use server';

import { getDb, submissions } from '@sabano/db';
import { isLocale } from '@sabano/i18n';
import { notify } from '@/lib/mail';
import { rateLimit } from '@/lib/ratelimit';
import { clientIpHash, trackingCode, userAgent } from '@/lib/security';
import { saveUpload } from '@/lib/uploads';
import { asciiDigits, normalizeWebsite, submissionSchema } from '@/lib/validation';

export type FormState =
  | { status: 'idle' }
  | { status: 'success'; code: string }
  | { status: 'error'; fieldErrors: Record<string, string>; formError?: string; values: Record<string, string> };

const FIELDS = ['type', 'name', 'contact', 'company', 'website', 'message', 'consent'] as const;

export async function submitCooperation(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? '')])) as Record<string, string>;
  const locale = String(formData.get('locale') ?? 'fa');

  // Spam traps: hidden honeypot field and an implausibly fast submission.
  const honeypot = String(formData.get('fax_number') ?? '');
  const startedAt = Number(formData.get('started_at') ?? 0);
  if (honeypot || (startedAt && Date.now() - startedAt < 2500)) {
    return { status: 'success', code: trackingCode() };
  }

  const ipHash = await clientIpHash();
  if (!rateLimit(`submit:${ipHash}`, 5, 10 * 60)) {
    return { status: 'error', fieldErrors: {}, formError: 'rateLimit', values };
  }

  const parsed = submissionSchema.safeParse(values);
  const fieldErrors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
  }

  const file = formData.get('attachment');
  let saved: Awaited<ReturnType<typeof saveUpload>> | null = null;
  if (file instanceof File && file.size > 0) {
    if (Object.keys(fieldErrors).length === 0) {
      saved = await saveUpload(file);
      if ('error' in saved) fieldErrors.attachment = saved.error;
    } else if (file.size > 8 * 1024 * 1024) {
      fieldErrors.attachment = 'fileSize';
    }
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { status: 'error', fieldErrors, values };
  }

  const data = parsed.data;
  const code = trackingCode();
  try {
    getDb()
      .insert(submissions)
      .values({
        code,
        type: data.type,
        name: data.name,
        contact: asciiDigits(data.contact),
        company: data.company || null,
        website: data.website ? normalizeWebsite(data.website) : null,
        message: data.message,
        locale: isLocale(locale) ? locale : 'fa',
        attachmentName: saved && !('error' in saved) ? saved.name : null,
        attachmentPath: saved && !('error' in saved) ? saved.relPath : null,
        attachmentMime: saved && !('error' in saved) ? saved.mime : null,
        attachmentSize: saved && !('error' in saved) ? saved.size : null,
        ipHash,
        userAgent: await userAgent(),
      })
      .run();
  } catch (err) {
    console.error('[sabano] Failed to store submission', err);
    return { status: 'error', fieldErrors: {}, formError: 'generic', values };
  }

  void notify(
    `[صبانو] درخواست جدید ${code} — ${data.type}`,
    [
      `کد پیگیری: ${code}`,
      `موضوع: ${data.type}`,
      `نام: ${data.name}`,
      `راه تماس: ${data.contact}`,
      data.company ? `شرکت: ${data.company}` : '',
      data.website ? `وب‌سایت: ${data.website}` : '',
      saved && !('error' in saved) ? `پیوست: ${saved.name}` : '',
      '',
      data.message,
    ]
      .filter(Boolean)
      .join('\n'),
  );

  return { status: 'success', code };
}
