'use client';

import { ImageIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useRef, useState, useTransition } from 'react';
import { inputClass } from './ui';
import { uploadImageAction } from '@/app/admin/(panel)/media/actions';

/** Text field holding an image path, with inline upload and preview. */
export function ImageField({ name, defaultValue, id }: { name: string; defaultValue?: string | null; id?: string }) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = (file: File) => {
    setError(null);
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const res = await uploadImageAction(fd);
      if (res.url) setValue(res.url);
      else setError(res.error ?? 'خطا');
    });
  };

  return (
    <div className="flex items-start gap-3">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-contain" />
        ) : (
          <ImageIcon className="size-7 text-subtle" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input id={id} name={name} value={value} onChange={(e) => setValue(e.target.value)} dir="ltr" placeholder="/media/… یا /images/…" className={inputClass} />
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-navy-800 hover:bg-surface">
            {pending ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <UploadSimpleIcon className="size-4" aria-hidden />}
            بارگذاری تصویر
          </button>
          {value && (
            <button type="button" onClick={() => setValue('')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
              <TrashIcon className="size-4" aria-hidden />
              حذف
            </button>
          )}
        </div>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      </div>
    </div>
  );
}
