import type { EntityKey } from '@sabano/db/admin';
import { faqCategories, sectors } from '@sabano/db/schema';

export type FieldType = 'text' | 'textarea' | 'url' | 'number' | 'select' | 'checkbox' | 'image' | 'slug';

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  /** For checkboxes: default when creating */
  defaultChecked?: boolean;
  rows?: number;
};

export type EntityConfig = {
  key: Exclude<EntityKey, 'posts'>;
  title: string;
  singular: string;
  description: string;
  base: FieldDef[];
  tr: FieldDef[];
  /** Translation field that decides whether a language exists */
  trKey: string;
  /** Translation field used as the row title in lists */
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  /** Public paths to revalidate / ping after a change */
  paths: string[];
};

const published: FieldDef = { name: 'published', label: 'نمایش در سایت', type: 'checkbox', defaultChecked: true };

const sectorLabels: Record<string, string> = { ai: 'هوش مصنوعی و داده', fintech: 'فین‌تک', digital: 'زیرساخت و خدمات دیجیتال', future: 'فناوری‌های آینده‌ساز' };
const faqLabels: Record<string, string> = { general: 'عمومی', investment: 'سرمایه‌گذاری', services: 'خدمات', cooperation: 'همکاری و ارسال طرح' };

export const entities: Record<EntityConfig['key'], EntityConfig> = {
  faqs: {
    key: 'faqs',
    title: 'پرسش‌های متداول',
    singular: 'پرسش',
    description: 'هر پرسش فقط در زبان‌هایی نمایش داده می‌شود که ترجمه دارد. ترتیب را با کشیدن ردیف‌ها تغییر دهید.',
    base: [{ name: 'category', label: 'دسته', type: 'select', required: true, options: faqCategories.map((c) => ({ value: c, label: faqLabels[c]! })) }, published],
    tr: [
      { name: 'question', label: 'پرسش', type: 'text', required: true },
      { name: 'answer', label: 'پاسخ', type: 'textarea', required: true, rows: 5, hint: 'پاسخ را کوتاه و مستقیم بنویسید؛ جملهٔ اول باید خودش پاسخ کامل باشد.' },
    ],
    trKey: 'question',
    titleField: 'question',
    paths: ['/faq', '/'],
  },
  people: {
    key: 'people',
    title: 'مدیران',
    singular: 'مدیر',
    description: 'مدیرعامل و اعضای هیئت‌مدیره که در صفحهٔ مدیران نمایش داده می‌شوند.',
    base: [
      { name: 'slug', label: 'شناسهٔ لاتین', type: 'slug', required: true, hint: 'مثلاً ali-salimi' },
      { name: 'group', label: 'گروه', type: 'select', required: true, options: [{ value: 'management', label: 'مدیریت' }, { value: 'board', label: 'هیئت‌مدیره' }] },
      { name: 'photo', label: 'عکس', type: 'image', hint: 'عکس مربعی با کیفیت بالا (حداقل ۸۰۰×۸۰۰)' },
      { name: 'linkedin', label: 'لینکدین', type: 'url' },
      published,
    ],
    tr: [
      { name: 'name', label: 'نام', type: 'text', required: true },
      { name: 'role', label: 'سمت', type: 'text', required: true },
      { name: 'bio', label: 'معرفی کوتاه', type: 'textarea', rows: 4 },
    ],
    trKey: 'name',
    titleField: 'name',
    subtitleField: 'role',
    imageField: 'photo',
    paths: ['/leadership', '/about'],
  },
  companies: {
    key: 'companies',
    title: 'پورتفولیو',
    singular: 'شرکت',
    description: 'شرکت‌هایی که صبانو همراهشان است. تا وقتی هیچ شرکتی منتشر نشده، صفحهٔ پورتفولیو از منو و نقشهٔ سایت پنهان می‌ماند.',
    base: [
      { name: 'slug', label: 'شناسهٔ لاتین', type: 'slug', required: true },
      { name: 'sector', label: 'حوزه', type: 'select', required: true, options: sectors.map((s) => ({ value: s, label: sectorLabels[s]! })) },
      { name: 'logo', label: 'لوگو', type: 'image' },
      { name: 'website', label: 'وب‌سایت', type: 'url' },
      { name: 'year', label: 'سال شروع همکاری (میلادی)', type: 'number' },
      published,
    ],
    tr: [
      { name: 'name', label: 'نام شرکت', type: 'text', required: true },
      { name: 'summary', label: 'خلاصه (یک تا دو جمله)', type: 'textarea', required: true, rows: 3 },
      { name: 'description', label: 'معرفی کامل', type: 'textarea', rows: 7 },
    ],
    trKey: 'name',
    titleField: 'name',
    subtitleField: 'summary',
    imageField: 'logo',
    paths: ['/portfolio', '/'],
  },
  partners: {
    key: 'partners',
    title: 'نهادهای مرتبط',
    singular: 'نهاد',
    description: 'لوگوهایی که در بخش «نهادهای مرتبط» صفحهٔ اصلی و دربارهٔ ما نمایش داده می‌شوند.',
    base: [{ name: 'logo', label: 'لوگو', type: 'image' }, { name: 'url', label: 'وب‌سایت', type: 'url' }, published],
    tr: [{ name: 'name', label: 'نام', type: 'text', required: true }],
    trKey: 'name',
    titleField: 'name',
    imageField: 'logo',
    paths: ['/', '/about'],
  },
  shareholders: {
    key: 'shareholders',
    title: 'سهامداران',
    singular: 'سهامدار',
    description: 'ساختار سهامداری که در صفحهٔ دربارهٔ صبانو نمایش داده می‌شود.',
    base: [
      { name: 'isMain', label: 'سهامدار اصلی', type: 'checkbox' },
      { name: 'logo', label: 'لوگو', type: 'image' },
      { name: 'url', label: 'وب‌سایت', type: 'url' },
      published,
    ],
    tr: [
      { name: 'name', label: 'نام', type: 'text', required: true },
      { name: 'description', label: 'توضیح کوتاه', type: 'text' },
    ],
    trKey: 'name',
    titleField: 'name',
    subtitleField: 'description',
    paths: ['/about'],
  },
};

export function isEntityKey(k: string): k is EntityConfig['key'] {
  return k in entities;
}
