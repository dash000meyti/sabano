import { listUsers } from '@sabano/db/admin';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Badge, Card, Field, Flash, inputClass, PageHeader } from '@/components/admin/ui';
import { requireUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { createUserAction, deleteUserAction, resetPasswordAction } from './actions';

export const metadata = { title: 'کاربران' };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const me = await requireUser('admin');
  const { saved, error } = await searchParams;
  const users = listUsers();
  return (
    <>
      <PageHeader title="کاربران پنل" description="مدیر کل به همهٔ بخش‌ها دسترسی دارد؛ ویرایشگر فقط محتوا و درخواست‌ها را مدیریت می‌کند." />
      <Flash message={saved ? 'تغییرات ذخیره شد.' : null} />
      <Flash message={error} tone="red" />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {users.map((u) => (
            <Card key={u.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-navy-900">
                    {u.name} {u.id === me.id && <span className="text-xs text-muted">(شما)</span>}
                  </p>
                  <p className="text-sm text-muted" dir="ltr">
                    {u.email}
                  </p>
                  <p className="mt-1 text-xs text-subtle">آخرین ورود: {u.lastLoginAt ? formatDate(u.lastLoginAt, 'fa', 'short') : '—'}</p>
                </div>
                <Badge tone={u.role === 'admin' ? 'navy' : 'teal'}>{u.role === 'admin' ? 'مدیر کل' : 'ویرایشگر'}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                <form action={resetPasswordAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <input name="password" type="password" dir="ltr" minLength={10} placeholder="رمز عبور جدید" autoComplete="new-password" className={`${inputClass} w-52`} />
                  <SubmitButton variant="outline">تغییر رمز</SubmitButton>
                </form>
                {u.id !== me.id && (
                  <form action={deleteUserAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <SubmitButton variant="ghost" className="text-red-600 hover:bg-red-50" confirm={`حساب ${u.email} حذف شود؟`}>
                      حذف
                    </SubmitButton>
                  </form>
                )}
              </div>
            </Card>
          ))}
        </div>
        <Card title="افزودن کاربر">
          <form action={createUserAction} className="grid gap-4">
            <Field label="نام" htmlFor="u-name">
              <input id="u-name" name="name" required className={inputClass} />
            </Field>
            <Field label="ایمیل" htmlFor="u-email">
              <input id="u-email" name="email" type="email" dir="ltr" required className={inputClass} />
            </Field>
            <Field label="رمز عبور" hint="حداقل ۱۰ نویسه" htmlFor="u-pass">
              <input id="u-pass" name="password" type="password" dir="ltr" minLength={10} required autoComplete="new-password" className={inputClass} />
            </Field>
            <Field label="نقش" htmlFor="u-role">
              <select id="u-role" name="role" className={inputClass}>
                <option value="editor">ویرایشگر</option>
                <option value="admin">مدیر کل</option>
              </select>
            </Field>
            <div>
              <SubmitButton>افزودن</SubmitButton>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
