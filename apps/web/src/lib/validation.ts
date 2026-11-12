import { z } from 'zod';
import { submissionTypes } from '@sabano/db/schema';

import { asciiDigits, isValidContact } from './contact';

export { asciiDigits, isValidContact };

export function normalizeWebsite(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Error values are message keys under `cooperation.errors`. */
export const submissionSchema = z.object({
  type: z.enum(submissionTypes, { error: 'type' }),
  name: z.string().trim().min(2, { error: 'required' }).max(120, { error: 'tooLong' }),
  contact: z.string().trim().min(1, { error: 'required' }).max(120, { error: 'tooLong' }).refine(isValidContact, { error: 'contact' }),
  company: z.string().trim().max(120, { error: 'tooLong' }).optional().default(''),
  website: z
    .string()
    .trim()
    .max(200, { error: 'tooLong' })
    .optional()
    .default('')
    .refine((v) => !v || normalizeWebsite(v) !== null, { error: 'url' }),
  message: z.string().trim().min(20, { error: 'tooShort' }).max(4000, { error: 'tooLong' }),
  consent: z.literal('on', { error: 'consent' }),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
