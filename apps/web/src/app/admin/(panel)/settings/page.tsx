import { getSetting } from '@sabano/db';
import { locales, localeMeta } from '@sabano/i18n';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Card, Field, Flash, inputClass, PageHeader } from '@/components/admin/ui';
import { requireUser } from '@/lib/auth';
import { saveSettingsAction } from './actions';

export const metadata = { title: 'تنظیمات سایت' };

function LocalizedInputs({ prefix, values, textarea }: { prefix: string; values: Partial<Record<string, string>>; textarea?: boolean }) {
  return (
    <div className="grid gap-3">
      {locales.map((l) => (
        <label key={l} className="grid grid-cols-[5.5rem_1fr] items-start gap-3 text-xs font-bold text-fg-muted">
          <span className="pt-2.5">{localeMeta[l].name}</span>
          {textarea ? (
            <textarea name={`${prefix}.${l}`} rows={2} defaultValue={values[l] ?? ''} dir={localeMeta[l].dir} className={inputClass} />
          ) : (
            <input name={`${prefix}.${l}`} defaultValue={values[l] ?? ''} dir={localeMeta[l].dir} className={inputClass} />
          )}
        </label>
      ))}
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireUser();
  const { saved } = await searchParams;
  const contact = getSetting('contact');
  const social = getSetting('social');
  const org = getSetting('org');
  const stats = getSetting('stats');

  return (
    <>
      <PageHeader title="تنظیمات سایت" description="اطلاعات تماس، شبکه‌های اجتماعی و اطلاعات حقوقی که در کل سایت، داده‌های ساختاریافته و llms.txt استفاده می‌شوند." />
      <Flash message={saved ? 'تنظیمات ذخیره شد و سایت به‌روز شد.' : null} />
      <div className="grid gap-6 2xl:grid-cols-2">
        <Card title="اطلاعات تماس">
          <form action={saveSettingsAction} className="grid gap-5">
            <input type="hidden" name="_section" value="contact" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="ایمیل" htmlFor="email">
                <input id="email" name="email" dir="ltr" defaultValue={contact.email} className={inputClass} />
              </Field>
              <Field label="کد پستی" htmlFor="postalCode">
                <input id="postalCode" name="postalCode" dir="ltr" defaultValue={contact.postalCode} className={inputClass} />
              </Field>
            </div>
            <Field label="شماره‌های تلفن" hint="هر شماره در یک خط، مثلاً 021-88517259" htmlFor="phones">
              <textarea id="phones" name="phones" rows={4} dir="ltr" defaultValue={contact.phones.join('\n')} className={inputClass} />
            </Field>
            <Field label="نشانی">
              <LocalizedInputs prefix="address" values={contact.address} textarea />
            </Field>
            <Field label="ساعات کاری" hint="اگر خالی بماند، در سایت نمایش داده نمی‌شود.">
              <LocalizedInputs prefix="hours" values={contact.hours} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="عرض جغرافیایی (Latitude)" hint="برای مسیریابی دقیق با نشان، بلد و گوگل" htmlFor="lat">
                <input id="lat" name="lat" dir="ltr" defaultValue={contact.lat ?? ''} className={inputClass} placeholder="35.72…" />
              </Field>
              <Field label="طول جغرافیایی (Longitude)" htmlFor="lng">
                <input id="lng" name="lng" dir="ltr" defaultValue={contact.lng ?? ''} className={inputClass} placeholder="51.42…" />
              </Field>
            </div>
            <div>
              <SubmitButton>ذخیرهٔ اطلاعات تماس</SubmitButton>
            </div>
          </form>
        </Card>
        <div className="space-y-6">
          <Card title="شبکه‌های اجتماعی" description="فقط شبکه‌هایی که نشانی دارند در فوتر نمایش داده می‌شوند و در sameAs ساختار داده قرار می‌گیرند.">
            <form action={saveSettingsAction} className="grid gap-4">
              <input type="hidden" name="_section" value="social" />
              {(
                [
                  ['linkedin', 'لینکدین'],
                  ['telegram', 'تلگرام'],
                  ['bale', 'بله'],
                  ['aparat', 'آپارات'],
                  ['whatsapp', 'واتساپ'],
                  ['instagram', 'اینستاگرام'],
                  ['x', 'ایکس'],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-xs font-bold text-fg-muted">
                  {label}
                  <input name={k} dir="ltr" defaultValue={social[k] ?? ''} placeholder="https://" className={inputClass} />
                </label>
              ))}
              <div>
                <SubmitButton>ذخیره</SubmitButton>
              </div>
            </form>
          </Card>
          <Card title="اطلاعات حقوقی" description="در داده‌های ساختاریافتهٔ سازمان (Schema.org) استفاده می‌شود و به اعتبار سایت نزد موتورهای جست‌وجو کمک می‌کند.">
            <form action={saveSettingsAction} className="grid gap-5">
              <input type="hidden" name="_section" value="org" />
              <Field label="نام حقوقی">
                <LocalizedInputs prefix="legalName" values={org.legalName} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="سال تأسیس (میلادی)" htmlFor="foundingYear">
                  <input id="foundingYear" name="foundingYear" dir="ltr" defaultValue={org.foundingYear ?? ''} className={inputClass} />
                </Field>
                <Field label="شمارهٔ ثبت" htmlFor="registrationNumber">
                  <input id="registrationNumber" name="registrationNumber" dir="ltr" defaultValue={org.registrationNumber ?? ''} className={inputClass} />
                </Field>
                <Field label="شناسهٔ ملی" htmlFor="nationalId">
                  <input id="nationalId" name="nationalId" dir="ltr" defaultValue={org.nationalId ?? ''} className={inputClass} />
                </Field>
              </div>
              <div>
                <SubmitButton>ذخیره</SubmitButton>
              </div>
            </form>
          </Card>
          <Card title="آمار کلیدی" description="فقط عددهای واقعی و تأییدشده وارد کنید؛ مثلاً تعداد شرکت‌های حمایت‌شده. موارد خالی نمایش داده نمی‌شوند.">
            <form action={saveSettingsAction} className="grid gap-5">
              <input type="hidden" name="_section" value="stats" />
              {[0, 1, 2, 3].map((i) => (
                <fieldset key={i} className="grid gap-3 rounded-xl border border-edge p-4">
                  <legend className="px-1 text-xs font-bold text-fg-muted">آمار {(i + 1).toLocaleString('fa-IR')}</legend>
                  <input name={`stat.${i}.value`} defaultValue={stats[i]?.value ?? ''} placeholder="مقدار، مثلاً ۴۵+" className={inputClass} />
                  <LocalizedInputs prefix={`stat.${i}.label`} values={stats[i]?.label ?? {}} />
                </fieldset>
              ))}
              <div>
                <SubmitButton>ذخیره</SubmitButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
