'use client';

import {
  ArrowArcLeftIcon,
  ArrowArcRightIcon,
  ImageIcon,
  LinkIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  type Icon,
} from '@phosphor-icons/react';
import ImageExt from '@tiptap/extension-image';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useId, useState, useTransition } from 'react';
import { cn } from '@sabano/ui';
import { uploadImageAction } from '@/app/admin/(panel)/media/actions';

/** Tiptap editor that mirrors its HTML into a hidden input so it posts with the form. */
export function RichTextEditor({ name, defaultValue, dir }: { name: string; defaultValue?: string; dir: 'rtl' | 'ltr' }) {
  const [html, setHtml] = useState(defaultValue ?? '');
  const [uploading, start] = useTransition();
  const fileId = useId();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } },
        codeBlock: false,
        code: false,
      }),
      ImageExt.configure({ HTMLAttributes: { loading: 'lazy' } }),
    ],
    content: defaultValue || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose-sabano min-h-[22rem] max-w-none px-5 py-4 outline-none',
        dir,
      },
    },
    onUpdate: ({ editor: e }) => setHtml(e.isEmpty ? '' : e.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bullet: e.isActive('bulletList'),
            ordered: e.isActive('orderedList'),
            quote: e.isActive('blockquote'),
            link: e.isActive('link'),
          }
        : null,
  });

  const btn = (label: string, active: boolean | undefined, onClick: () => void, IconC?: Icon, text?: string) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={!!active}
      onClick={onClick}
      className={cn('grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-sm font-bold transition-colors', active ? 'bg-fg text-canvas' : 'text-fg/80 hover:bg-tint')}
    >
      {IconC ? <IconC weight="bold" className="size-4" aria-hidden /> : text}
    </button>
  );

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('نشانی لینک (خالی = حذف لینک)', prev ?? 'https://');
    if (url === null) return;
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url, ...(url.startsWith('http') && !url.includes('sabano.ir') ? { target: '_blank' } : {}) }).run();
  };

  const uploadImage = (file: File) => {
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const res = await uploadImageAction(fd);
      if (res.url && editor) {
        const alt = window.prompt('متن جایگزین تصویر (alt)', '') ?? '';
        editor.chain().focus().setImage({ src: res.url, alt }).run();
      } else if (res.error) window.alert(res.error);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-card focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
      <div className="flex flex-wrap items-center gap-1 border-b border-edge bg-canvas-alt/70 p-1.5" dir="rtl">
        {btn('عنوان ۲', state?.h2, () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), undefined, 'H2')}
        {btn('عنوان ۳', state?.h3, () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), undefined, 'H3')}
        <span className="mx-1 h-5 w-px bg-edge" />
        {btn('پررنگ', state?.bold, () => editor?.chain().focus().toggleBold().run(), TextBIcon)}
        {btn('مورب', state?.italic, () => editor?.chain().focus().toggleItalic().run(), TextItalicIcon)}
        {btn('زیرخط', state?.underline, () => editor?.chain().focus().toggleUnderline().run(), TextUnderlineIcon)}
        {btn('لینک', state?.link, setLink, LinkIcon)}
        <span className="mx-1 h-5 w-px bg-edge" />
        {btn('فهرست', state?.bullet, () => editor?.chain().focus().toggleBulletList().run(), ListBulletsIcon)}
        {btn('فهرست شماره‌دار', state?.ordered, () => editor?.chain().focus().toggleOrderedList().run(), ListNumbersIcon)}
        {btn('نقل‌قول', state?.quote, () => editor?.chain().focus().toggleBlockquote().run(), QuotesIcon)}
        {btn('خط جداکننده', false, () => editor?.chain().focus().setHorizontalRule().run(), MinusIcon)}
        <label
          htmlFor={fileId}
          title="تصویر"
          aria-label={uploading ? 'در حال بارگذاری…' : 'تصویر'}
          className="grid h-8 min-w-8 cursor-pointer place-items-center rounded-lg px-1.5 text-fg/80 hover:bg-tint"
        >
          {uploading ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <ImageIcon weight="bold" className="size-4" aria-hidden />}
        </label>
        <span className="mx-1 h-5 w-px bg-edge" />
        {btn('بازگردانی', false, () => editor?.chain().focus().undo().run(), ArrowArcRightIcon)}
        {btn('انجام دوباره', false, () => editor?.chain().focus().redo().run(), ArrowArcLeftIcon)}
        <input
          id={fileId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) uploadImage(e.target.files[0]);
            e.target.value = '';
          }}
        />
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
