import Link from 'next/link';
import type { EntityRecord } from '@sabano/db/admin';
import { locales, localeMeta, type Locale } from '@sabano/i18n';
import { buttonClasses, cn } from '@sabano/ui';
import { deletePostAction, savePostAction } from '@/app/admin/(panel)/posts/actions';
import { ImageField } from './ImageField';
import { LocaleTabs } from './LocaleTabs';
import { RichTextEditor } from './RichTextEditor';
import { SubmitButton } from './SubmitButton';
import { Card, Field, Flash, inputClass, PageHeader } from './ui';

/** Tehran-local value for <input type="datetime-local"> */
function toLocalInput(d: unknown): string {
  if (!(d instanceof Date)) return '';
  const tehran = new Date(d.getTime() + 3.5 * 3600 * 1000);
  return tehran.toISOString().slice(0, 16);
}

export function PostForm({ record, saved, error }: { record?: EntityRecord; saved?: boolean; error?: string }) {
  const isNew = !record;
  const filled = Object.fromEntries(locales.map((l) => [l, !!record?.translations[l]])) as Record<Locale, boolean>;
  const tr = (l: Locale, k: string) => (record?.translations[l]?.[k] as string | null | undefined) ?? '';
  const panels = Object.fromEntries(
    locales.map((l) => [
      l,
      <div key={l} className="grid gap-5">
        {l !== 'fa' && <p className="text-xs leading-6 text-muted">برای منتشر نشدن مطلب در این زبان، عنوان را خالی بگذارید.</p>}
        <Field label="عنوان" htmlFor={`t-${l}-title`}>
          <input id={`t-${l}-title`} name={`t.${l}.title`} defaultValue={tr(l, 'title')} className={cn(inputClass, 'text-base font-bold')} />
        </Field>
        <Field label="خلاصه" hint="یک تا دو جمله؛ در فهرست مطالب، شبکه‌های اجتماعی و نتایج جست‌وجو نمایش داده می‌شود." htmlFor={`t-${l}-excerpt`}>
          <textarea id={`t-${l}-excerpt`} name={`t.${l}.excerpt`} rows={3} defaultValue={tr(l, 'excerpt')} className={inputClass} />
        </Field>
        <Field label="متن مطلب" hint="برای ساختار بهتر در موتورهای جست‌وجو و پاسخ، از عنوان‌های H2 به شکل پرسش استفاده کنید.">
          <RichTextEditor name={`t.${l}.body`} defaultValue={tr(l, 'body')} dir={localeMeta[l].dir} />
        </Field>
        <details className="rounded-xl border border-line p-4">
          <summary className="cursor-pointer text-sm font-bold text-navy-900">تنظیمات سئو و تصویر</summary>
          <div className="mt-4 grid gap-4">
            <Field label="متن جایگزین تصویر کاور (alt)" htmlFor={`t-${l}-coverAlt`}>
              <input id={`t-${l}-coverAlt`} name={`t.${l}.coverAlt`} defaultValue={tr(l, 'coverAlt')} className={inputClass} />
            </Field>
            <Field label="عنوان سئو (اختیاری)" hint="حداکثر حدود ۶۰ نویسه. اگر خالی باشد، عنوان مطلب استفاده می‌شود." htmlFor={`t-${l}-seoTitle`}>
              <input id={`t-${l}-seoTitle`} name={`t.${l}.seoTitle`} defaultValue={tr(l, 'seoTitle')} maxLength={90} className={inputClass} />
            </Field>
            <Field label="توضیح سئو (اختیاری)" hint="حداکثر حدود ۱۵۵ نویسه. اگر خالی باشد، خلاصه استفاده می‌شود." htmlFor={`t-${l}-seoDescription`}>
              <textarea id={`t-${l}-seoDescription`} name={`t.${l}.seoDescription`} rows={2} defaultValue={tr(l, 'seoDescription')} maxLength={200} className={inputClass} />
            </Field>
          </div>
        </details>
      </div>,
    ]),
  ) as Record<Locale, React.ReactNode>;

  const faTitle = record?.translations.fa?.title ?? record?.translations.en?.title;
  return (
    <>
      <PageHeader
        title={isNew ? 'مطلب جدید' : String(faTitle ?? 'ویرایش مطلب')}
        description="اخبار و تحلیل"
        actions={
          <>
            {!isNew && record.status === 'published' && (
              <a href={`/news/${String(record.slug)}`} target="_blank" className={buttonClasses('outline', 'sm')}>
                مشاهده در سایت
              </a>
            )}
            <Link href="/admin/posts" className={buttonClasses('outline', 'sm')}>
              بازگشت
            </Link>
          </>
        }
      />
      <Flash message={saved ? 'مطلب ذخیره شد و سایت به‌روز شد.' : null} />
      <Flash message={error} tone="red" />
      <form action={savePostAction} className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <input type="hidden" name="_id" value={record?.id ?? ''} />
        <Card title="محتوا به تفکیک زبان">
          <LocaleTabs filled={filled} panels={panels} />
        </Card>
        <div className="space-y-6">
          <Card title="انتشار">
            <div className="grid gap-4">
              <Field label="وضعیت" htmlFor="status">
                <select id="status" name="status" defaultValue={String(record?.status ?? 'draft')} className={inputClass}>
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشرشده</option>
                </select>
              </Field>
              <Field label="تاریخ و ساعت انتشار (به وقت تهران)" hint="برای زمان‌بندی، تاریخی در آینده وارد کنید." htmlFor="publishedAt">
                <input id="publishedAt" name="publishedAt" type="datetime-local" dir="ltr" defaultValue={toLocalInput(record?.publishedAt)} className={inputClass} />
              </Field>
              <label className="flex items-center gap-2.5 text-sm font-semibold text-navy-900">
                <input type="checkbox" name="featured" defaultChecked={record?.featured === true} className="size-4.5 accent-teal-600" />
                مطلب ویژه
              </label>
              <SubmitButton>ذخیره</SubmitButton>
            </div>
          </Card>
          <Card title="مشخصات">
            <div className="grid gap-4">
              <Field label="شناسهٔ لاتین (slug)" hint="بخشی از نشانی صفحه؛ مثلاً guarantee-guide" htmlFor="slug">
                <input id="slug" name="slug" dir="ltr" required defaultValue={String(record?.slug ?? '')} className={inputClass} />
              </Field>
              <Field label="دسته" htmlFor="category">
                <select id="category" name="category" defaultValue={String(record?.category ?? 'news')} className={inputClass}>
                  <option value="news">خبر</option>
                  <option value="insight">تحلیل</option>
                  <option value="guide">راهنما</option>
                </select>
              </Field>
              <Field label="تصویر کاور" hint="نسبت ۱۶ به ۹، حداقل ۱۶۰۰ پیکسل عرض">
                <ImageField name="coverImage" defaultValue={(record?.coverImage as string | null) ?? ''} />
              </Field>
            </div>
          </Card>
        </div>
      </form>
      {!isNew && (
        <form action={deletePostAction} className="mt-10 border-t border-line pt-6">
          <input type="hidden" name="_id" value={record.id} />
          <SubmitButton variant="ghost" className="text-red-600 hover:bg-red-50" confirm="این مطلب در همهٔ زبان‌ها حذف شود؟">
            حذف مطلب
          </SubmitButton>
        </form>
      )}
    </>
  );
}
