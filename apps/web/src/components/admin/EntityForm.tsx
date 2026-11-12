import Link from 'next/link';
import type { EntityRecord } from '@sabano/db/admin';
import { locales, type Locale } from '@sabano/i18n';
import { buttonClasses, cn } from '@sabano/ui';
import { deleteEntityAction, saveEntityAction } from '@/app/admin/(panel)/content/actions';
import type { EntityConfig, FieldDef } from '@/lib/admin-entities';
import { ImageField } from './ImageField';
import { LocaleTabs } from './LocaleTabs';
import { SubmitButton } from './SubmitButton';
import { Card, Field, Flash, inputClass, PageHeader } from './ui';

function Input({ f, name, value, isNew }: { f: FieldDef; name: string; value: unknown; isNew: boolean }) {
  const id = name.replace(/\./g, '-');
  const v = value === null || value === undefined ? '' : String(value);
  switch (f.type) {
    case 'textarea':
      return <textarea id={id} name={name} rows={f.rows ?? 4} defaultValue={v} className={cn(inputClass, 'leading-7')} />;
    case 'select':
      return (
        <select id={id} name={name} defaultValue={v || f.options?.[0]?.value} className={inputClass}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'checkbox':
      return (
        <label className="flex items-center gap-2.5 text-sm font-semibold text-navy-900">
          <input type="checkbox" name={name} defaultChecked={isNew ? !!f.defaultChecked : value === true} className="size-4.5 accent-teal-600" />
          {f.label}
        </label>
      );
    case 'image':
      return <ImageField id={id} name={name} defaultValue={v} />;
    case 'number':
      return <input id={id} name={name} type="number" dir="ltr" defaultValue={v} className={inputClass} />;
    case 'url':
    case 'slug':
      return <input id={id} name={name} dir="ltr" defaultValue={v} className={inputClass} placeholder={f.type === 'url' ? 'https://' : undefined} />;
    default:
      return <input id={id} name={name} defaultValue={v} className={inputClass} />;
  }
}

export function EntityForm({ cfg, record, saved, error }: { cfg: EntityConfig; record?: EntityRecord; saved?: boolean; error?: string }) {
  const isNew = !record;
  const filled = Object.fromEntries(locales.map((l) => [l, !!record?.translations[l]])) as Record<Locale, boolean>;
  const faTitle = record?.translations.fa?.[cfg.titleField] ?? record?.translations.en?.[cfg.titleField];
  const panels = Object.fromEntries(
    locales.map((l) => [
      l,
      <div key={l} className="grid gap-5">
        {l !== 'fa' && <p className="text-xs leading-6 text-muted">برای حذف این زبان از سایت، فیلد «{cfg.tr.find((f) => f.name === cfg.trKey)?.label}» را خالی بگذارید.</p>}
        {cfg.tr.map((f) => (
          <Field key={f.name} label={f.label} required={f.required} hint={f.hint} htmlFor={`t-${l}-${f.name}`}>
            <Input f={f} name={`t.${l}.${f.name}`} value={record?.translations[l]?.[f.name]} isNew={isNew} />
          </Field>
        ))}
      </div>,
    ]),
  ) as Record<Locale, React.ReactNode>;

  return (
    <>
      <PageHeader
        title={isNew ? `افزودن ${cfg.singular}` : String(faTitle ?? cfg.singular)}
        description={cfg.title}
        actions={
          <Link href={`/admin/content/${cfg.key}`} className={buttonClasses('outline', 'sm')}>
            بازگشت
          </Link>
        }
      />
      <Flash message={saved ? 'ذخیره شد و سایت به‌روز شد.' : null} />
      <Flash message={error} tone="red" />
      <form action={saveEntityAction} className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <input type="hidden" name="_entity" value={cfg.key} />
        <input type="hidden" name="_id" value={record?.id ?? ''} />
        <Card title="متن‌ها به تفکیک زبان" description="نقطهٔ سبز یعنی آن زبان ترجمه دارد؛ نقطهٔ زرد یعنی هنوز ترجمه نشده است.">
          <LocaleTabs filled={filled} panels={panels} />
        </Card>
        <div className="space-y-6">
          <Card title="مشخصات">
            <div className="grid gap-5">
              {cfg.base.map((f) =>
                f.type === 'checkbox' ? (
                  <Input key={f.name} f={f} name={`b.${f.name}`} value={record?.[f.name]} isNew={isNew} />
                ) : (
                  <Field key={f.name} label={f.label} required={f.required} hint={f.hint} htmlFor={`b-${f.name}`}>
                    <Input f={f} name={`b.${f.name}`} value={record?.[f.name]} isNew={isNew} />
                  </Field>
                ),
              )}
            </div>
          </Card>
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton>ذخیره</SubmitButton>
          </div>
        </div>
      </form>
      {!isNew && (
        <form action={deleteEntityAction} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="_entity" value={cfg.key} />
          <input type="hidden" name="_id" value={record.id} />
          <SubmitButton variant="ghost" className="text-red-600 hover:bg-red-50" confirm={`این ${cfg.singular} برای همیشه حذف شود؟`}>
            حذف {cfg.singular}
          </SubmitButton>
        </form>
      )}
    </>
  );
}
