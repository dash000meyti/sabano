'use server';

import { redirect } from 'next/navigation';
import { adminDelete, adminReorder, adminSave, slugExists } from '@sabano/db/admin';
import { locales, type Locale } from '@sabano/i18n';
import { entities, isEntityKey, type FieldDef } from '@/lib/admin-entities';
import { requireUser } from '@/lib/auth';
import { revalidateSite } from '@/lib/revalidate';

/** Images must be local (/media/… from the library or /images/…): next/image only serves those. */
const LOCAL_IMAGE = /^\/(media|images)\/[\w\-./]+$/;

function readField(f: FieldDef, raw: FormDataEntryValue | null): unknown {
  const v = typeof raw === 'string' ? raw.trim() : '';
  switch (f.type) {
    case 'checkbox':
      return raw === 'on';
    case 'select':
      return f.options?.some((o) => o.value === v) ? v : null;
    case 'image':
      return v && LOCAL_IMAGE.test(v) && !v.includes('..') ? v : null;
    case 'url':
      // Links are rendered as hrefs: only real web links (no javascript:, data:, …).
      return /^https?:\/\/[^\s"<>]+$/i.test(v) ? v.slice(0, 500) : null;
    case 'number':
      return v ? Number.parseInt(v, 10) || null : null;
    case 'slug':
      return v.toLowerCase();
    default:
      return v || null;
  }
}

export async function saveEntityAction(formData: FormData) {
  await requireUser();
  const key = String(formData.get('_entity'));
  if (!isEntityKey(key)) throw new Error('Unknown entity');
  const cfg = entities[key];
  const id = Number(formData.get('_id')) || null;
  const errors: string[] = [];

  const base: Record<string, unknown> = {};
  for (const f of cfg.base) {
    const value = readField(f, formData.get(`b.${f.name}`));
    if (f.required && (value === null || value === '')) errors.push(`«${f.label}» الزامی است.`);
    if (f.type === 'slug' && typeof value === 'string') {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) errors.push('شناسهٔ لاتین فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.');
      else if ((key === 'people' || key === 'companies') && slugExists(key, value, id ?? undefined)) errors.push('این شناسه قبلاً استفاده شده است.');
    }
    if (f.type === 'url' && typeof value === 'string' && !/^https?:\/\//.test(value)) errors.push(`«${f.label}» باید با http:// یا https:// شروع شود.`);
    base[f.name] = value;
  }

  const translations: Partial<Record<Locale, Record<string, unknown>>> = {};
  for (const l of locales) {
    const tr: Record<string, unknown> = {};
    for (const f of cfg.tr) tr[f.name] = readField(f, formData.get(`t.${l}.${f.name}`));
    if (!tr[cfg.trKey]) continue; // language left empty → not published in that language
    for (const f of cfg.tr) {
      if (f.required && !tr[f.name]) errors.push(`«${f.label}» در زبان ${l} الزامی است.`);
      if (tr[f.name] === null && f.required) tr[f.name] = '';
    }
    translations[l] = tr;
  }
  if (!translations.fa && !translations.en) errors.push('حداقل نسخهٔ فارسی یا انگلیسی را تکمیل کنید.');

  if (errors.length) {
    const back = id ? `/admin/content/${key}/${id}` : `/admin/content/${key}/new`;
    redirect(`${back}?error=${encodeURIComponent(errors.slice(0, 4).join(' '))}`);
  }

  const savedId = adminSave(key, id, base, translations);
  revalidateSite(cfg.paths);
  redirect(`/admin/content/${key}/${savedId}?saved=1`);
}

export async function deleteEntityAction(formData: FormData) {
  await requireUser();
  const key = String(formData.get('_entity'));
  if (!isEntityKey(key)) throw new Error('Unknown entity');
  adminDelete(key, Number(formData.get('_id')));
  revalidateSite(entities[key].paths);
  redirect(`/admin/content/${key}?deleted=1`);
}

export async function reorderEntityAction(key: string, ids: number[]) {
  await requireUser();
  if (!isEntityKey(key)) throw new Error('Unknown entity');
  adminReorder(key, ids.map(Number).filter(Boolean));
  revalidateSite();
}
