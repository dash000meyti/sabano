import type { SubmissionStatus, SubmissionType } from '@sabano/db/schema';

export const typeLabels: Record<SubmissionType, string> = {
  investment: 'فرصت سرمایه‌گذاری',
  partnership: 'همکاری راهبردی',
  financing: 'تأمین مالی',
  employment: 'استخدام',
  other: 'سایر',
};

export const statusLabels: Record<SubmissionStatus, string> = {
  new: 'جدید',
  reviewing: 'در حال بررسی',
  replied: 'پاسخ داده شده',
  archived: 'بایگانی',
};

export const statusTones: Record<SubmissionStatus, 'gold' | 'teal' | 'gray' | 'navy'> = {
  new: 'gold',
  reviewing: 'teal',
  replied: 'navy',
  archived: 'gray',
};
