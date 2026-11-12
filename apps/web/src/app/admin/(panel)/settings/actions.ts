'use server';

import { redirect } from 'next/navigation';
import { getSetting, setSetting, type ContactSettings, type OrgSettings, type SocialSettings, type StatItem } from '@sabano/db';
import { locales } from '@sabano/i18n';
import { requireUser } from '@/lib/auth';
import { revalidateSite } from '@/lib/revalidate';

const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const localized = (fd: FormData, prefix: string) => Object.fromEntries(locales.map((l) => [l, s(fd, `${prefix}.${l}`)]).filter(([, v]) => v));

export async function saveSettingsAction(formData: FormData) {
  await requireUser();
  const section = s(formData, '_section');
  if (section === 'contact') {
    const lat = Number.parseFloat(s(formData, 'lat'));
    const lng = Number.parseFloat(s(formData, 'lng'));
    const value: ContactSettings = {
      ...getSetting('contact'),
      email: s(formData, 'email'),
      phones: s(formData, 'phones').split(/[\n,،]+/).map((p) => p.trim()).filter(Boolean),
      postalCode: s(formData, 'postalCode'),
      address: localized(formData, 'address'),
      hours: localized(formData, 'hours'),
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
    };
    setSetting('contact', value);
  } else if (section === 'social') {
    const keys = ['linkedin', 'telegram', 'bale', 'aparat', 'whatsapp', 'instagram', 'x'] as const;
    const value: SocialSettings = {};
    for (const k of keys) {
      const v = s(formData, k);
      if (v && /^https?:\/\//.test(v)) value[k] = v;
    }
    setSetting('social', value);
  } else if (section === 'org') {
    const value: OrgSettings = {
      legalName: localized(formData, 'legalName'),
      foundingYear: s(formData, 'foundingYear') || undefined,
      registrationNumber: s(formData, 'registrationNumber') || undefined,
      nationalId: s(formData, 'nationalId') || undefined,
    };
    setSetting('org', value);
  } else if (section === 'stats') {
    const stats: StatItem[] = [];
    for (let i = 0; i < 4; i++) {
      const v = s(formData, `stat.${i}.value`);
      if (v) stats.push({ value: v, label: localized(formData, `stat.${i}.label`) });
    }
    setSetting('stats', stats);
  }
  revalidateSite();
  redirect(`/admin/settings?saved=${section}`);
}
