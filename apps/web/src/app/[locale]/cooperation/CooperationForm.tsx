'use client';

import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CopyIcon,
  HandCoinsIcon,
  HandshakeIcon,
  LightbulbIcon,
  PaperclipIcon,
  RocketLaunchIcon,
  TrashIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
  type Icon,
} from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { startTransition, useActionState, useEffect, useId, useRef, useState } from 'react';
import { buttonClasses, cn } from '@sabano/ui';
import { Link } from '@/i18n/navigation';
import { isValidContact } from '@/lib/contact';
import { submitCooperation, type FormState } from './actions';

const TYPES = ['investment', 'financing', 'partnership', 'employment', 'other'] as const;
const typeIcons: Record<(typeof TYPES)[number], Icon> = {
  investment: RocketLaunchIcon,
  financing: HandCoinsIcon,
  partnership: HandshakeIcon,
  employment: BriefcaseIcon,
  other: LightbulbIcon,
};
const STEP_FIELDS: string[][] = [['type'], ['name', 'contact', 'company', 'website'], ['message', 'attachment', 'consent']];
const MAX = 8 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png';

const without = (o: Record<string, string>, key: string) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key));
const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

export function CooperationForm({ email, initialType }: { email: string; initialType?: string }) {
  const t = useTranslations('cooperation');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<FormState, FormData>(submitCooperation, { status: 'idle' });
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    type: TYPES.includes(initialType as (typeof TYPES)[number]) ? (initialType as string) : '',
    name: '',
    contact: '',
    company: '',
    website: '',
    message: '',
    consent: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const id = useId();

  // Merge server-side errors and jump to the first step that has one (adjust state during render).
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === 'error') {
      setErrors(state.fieldErrors);
      const first = STEP_FIELDS.findIndex((fields) => fields.some((f) => state.fieldErrors[f]));
      if (first >= 0) setStep(first);
    }
  }

  useEffect(() => {
    if (state.status === 'success') topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state.status]);

  const set = (k: keyof typeof values, v: string | boolean) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => without(e, k));
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0 && !values.type) e.type = 'type';
    if (s === 1) {
      if (values.name.trim().length < 2) e.name = 'required';
      if (!values.contact.trim()) e.contact = 'required';
      else if (!isValidContact(values.contact)) e.contact = 'contact';
    }
    if (s === 2) {
      if (values.message.trim().length < 20) e.message = 'tooShort';
      if (file && file.size > MAX) e.attachment = 'fileSize';
      if (!values.consent) e.consent = 'consent';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onFile = (f: File | null) => {
    setErrors((e) => without(e, 'attachment'));
    if (f && f.size > MAX) {
      setErrors((e) => ({ ...e, attachment: 'fileSize' }));
      return;
    }
    if (f && !ACCEPT.split(',').some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setErrors((e) => ({ ...e, attachment: 'fileType' }));
      return;
    }
    setFile(f);
    if (fileRef.current) {
      const dt = new DataTransfer();
      if (f) dt.items.add(f);
      fileRef.current.files = dt.files;
    }
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    for (let s = 0; s < 3; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-600" role="alert">
        <WarningCircleIcon weight="fill" className="size-4" aria-hidden />
        {t(`errors.${errors[k]}`, { email })}
      </p>
    ) : null;

  const inputCls = (k: string) =>
    cn(
      'mt-2 block w-full rounded-2xl border bg-white px-4 py-3.5 text-[0.98rem] text-navy-900 outline-none transition-all placeholder:text-subtle focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10',
      errors[k] ? 'border-red-400' : 'border-line',
    );

  if (state.status === 'success') {
    return (
      <div ref={topRef} className="scroll-mt-28 rounded-[2rem] border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-8 text-center sm:p-12" role="status">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-teal-500 text-white shadow-[0_12px_30px_-10px_rgb(0_170_169/0.8)]">
          <CheckCircleIcon weight="fill" className="size-9" aria-hidden />
        </span>
        <h2 className="mt-6 text-2xl font-extrabold text-navy-900">{t('success.title')}</h2>
        <p className="mx-auto mt-3 max-w-md leading-8 text-muted">{t('success.text')}</p>
        <div className="mx-auto mt-7 inline-flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-3">
          <span className="text-sm text-muted">{t('success.code')}</span>
          <span className="font-mono text-lg font-bold tracking-wider text-navy-900" dir="ltr">
            {state.code}
          </span>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(state.code);
              setCopied(true);
            }}
            className="grid size-8 place-items-center rounded-lg text-teal-700 hover:bg-teal-50"
            aria-label="Copy"
          >
            {copied ? <CheckCircleIcon weight="fill" className="size-5" /> : <CopyIcon className="size-5" />}
          </button>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className={buttonClasses('outline', 'md')}>
            {t('success.again')}
          </button>
          <Link href="/" className={buttonClasses('primary', 'md')}>
            {t('success.home')}
          </Link>
        </div>
      </div>
    );
  }

  const steps = t.raw('form.steps') as string[];

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Progress */}
      <ol className="flex items-center gap-3" aria-label={t('form.stepOf', { current: step + 1, total: 3 })}>
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-full text-sm font-black transition-colors',
                i < step ? 'bg-teal-500 text-white' : i === step ? 'bg-navy-900 text-white' : 'bg-surface text-subtle ring-1 ring-line',
              )}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? <CheckCircleIcon weight="bold" className="size-5" aria-hidden /> : locale === 'fa' ? '۱۲۳'[i] : i + 1}
            </span>
            <span className={cn('hidden text-sm font-bold sm:block', i === step ? 'text-navy-900' : 'text-subtle')}>{label}</span>
            {i < 2 && <span className={cn('h-px flex-1', i < step ? 'bg-teal-400' : 'bg-line')} />}
          </li>
        ))}
      </ol>

      <form action={formAction} onSubmit={onSubmit} noValidate className="mt-8" encType="multipart/form-data">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="started_at" value={startedAt} />
        <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Fax
            <input type="text" name="fax_number" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* Step 1 — type */}
        <fieldset data-step-hidden={step !== 0} className="space-y-3">
          <legend className="text-lg font-extrabold text-navy-900">{t('form.type')}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TYPES.map((type) => {
              const Icon = typeIcons[type];
              const checked = values.type === type;
              return (
                <label
                  key={type}
                  className={cn(
                    'group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all',
                    checked ? 'border-teal-500 bg-teal-50/60 ring-4 ring-teal-500/10' : 'border-line bg-white hover:border-navy-900/25',
                    type === 'other' && 'sm:col-span-2',
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={checked}
                    onChange={() => set('type', type)}
                    className="peer sr-only"
                    aria-describedby={errors.type ? `${id}-type-err` : undefined}
                  />
                  <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl transition-colors', checked ? 'bg-teal-500 text-white' : 'bg-surface text-teal-700')}>
                    <Icon weight="duotone" className="size-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-bold text-navy-900">{t(`form.types.${type}`)}</span>
                    <span className="mt-0.5 block text-sm leading-6 text-muted">{t(`form.typeHints.${type}`)}</span>
                  </span>
                  <span className="absolute end-4 top-4 hidden size-5 rounded-full border-2 border-line peer-checked:block peer-checked:border-[6px] peer-checked:border-teal-500 sm:block" aria-hidden />
                  <span className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400" />
                </label>
              );
            })}
          </div>
          {err('type')}
        </fieldset>

        {/* Step 2 — contact */}
        <fieldset data-step-hidden={step !== 1} className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-1 text-lg font-extrabold text-navy-900 sm:col-span-2">{steps[1]}</legend>
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-name`} className="text-sm font-bold text-navy-900">
              {t('form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id={`${id}-name`}
              name="name"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              autoComplete="name"
              maxLength={120}
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${id}-name-err` : undefined}
              className={inputCls('name')}
            />
            {err('name')}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-contact`} className="text-sm font-bold text-navy-900">
              {t('form.contact')} <span className="text-red-500">*</span>
            </label>
            <input
              id={`${id}-contact`}
              name="contact"
              value={values.contact}
              onChange={(e) => set('contact', e.target.value)}
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              maxLength={120}
              required
              aria-invalid={!!errors.contact}
              aria-describedby={`${id}-contact-hint${errors.contact ? ` ${id}-contact-err` : ''}`}
              className={cn(inputCls('contact'), 'text-start rtl:text-end')}
            />
            <p id={`${id}-contact-hint`} className="mt-2 text-xs text-muted">
              {t('form.contactHint')}
            </p>
            {err('contact')}
          </div>
          <div>
            <label htmlFor={`${id}-company`} className="text-sm font-bold text-navy-900">
              {t('form.company')} <span className="font-normal text-subtle">({t('form.optional')})</span>
            </label>
            <input id={`${id}-company`} name="company" value={values.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" maxLength={120} className={inputCls('company')} />
            {err('company')}
          </div>
          <div>
            <label htmlFor={`${id}-website`} className="text-sm font-bold text-navy-900">
              {t('form.website')} <span className="font-normal text-subtle">({t('form.optional')})</span>
            </label>
            <input
              id={`${id}-website`}
              name="website"
              value={values.website}
              onChange={(e) => set('website', e.target.value)}
              autoComplete="url"
              inputMode="url"
              dir="ltr"
              placeholder="example.com"
              maxLength={200}
              className={cn(inputCls('website'), 'text-start rtl:text-end')}
            />
            {err('website')}
          </div>
        </fieldset>

        {/* Step 3 — details */}
        <fieldset data-step-hidden={step !== 2} className="space-y-5">
          <legend className="mb-1 text-lg font-extrabold text-navy-900">{steps[2]}</legend>
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`${id}-message`} className="text-sm font-bold text-navy-900">
                {t('form.message')} <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-subtle">{t('form.characters', { count: values.message.length })}</span>
            </div>
            <textarea
              id={`${id}-message`}
              name="message"
              rows={6}
              value={values.message}
              onChange={(e) => set('message', e.target.value)}
              maxLength={4000}
              required
              aria-invalid={!!errors.message}
              aria-describedby={`${id}-message-hint${errors.message ? ` ${id}-message-err` : ''}`}
              className={cn(inputCls('message'), 'resize-y leading-8')}
            />
            <p id={`${id}-message-hint`} className="mt-2 text-xs text-muted">
              {t('form.messageHint')}
            </p>
            {err('message')}
          </div>

          <div>
            <p className="text-sm font-bold text-navy-900">
              {t('form.attachment')} <span className="font-normal text-subtle">({t('form.optional')})</span>
            </p>
            <input
              ref={fileRef}
              id={`${id}-file`}
              type="file"
              name="attachment"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              aria-describedby={`${id}-file-hint`}
            />
            {file ? (
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
                <PaperclipIcon weight="duotone" className="size-6 shrink-0 text-teal-700" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-navy-900" dir="auto">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted" dir="ltr">
                    {fmtSize(file.size)}
                  </span>
                </span>
                <button type="button" onClick={() => onFile(null)} className="grid size-9 place-items-center rounded-xl text-red-600 hover:bg-red-50" aria-label={t('form.removeFile')}>
                  <TrashIcon weight="duotone" className="size-5" aria-hidden />
                </button>
              </div>
            ) : (
              <label
                htmlFor={`${id}-file`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  onFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={cn(
                  'mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors',
                  drag ? 'border-teal-500 bg-teal-50' : 'border-line bg-surface/60 hover:border-teal-300',
                )}
              >
                <UploadSimpleIcon weight="duotone" className="size-8 text-teal-600" aria-hidden />
                <span className="text-sm text-navy-800">
                  {t('form.dropFile')} <span className="font-bold text-teal-700 underline underline-offset-4">{t('form.chooseFile')}</span>
                </span>
                <span id={`${id}-file-hint`} className="text-xs text-muted">
                  {t('form.attachmentHint')}
                </span>
              </label>
            )}
            {err('attachment')}
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-7 text-navy-800">
              <input
                type="checkbox"
                name="consent"
                checked={values.consent}
                onChange={(e) => set('consent', e.target.checked)}
                className="mt-1.5 size-4.5 shrink-0 accent-teal-600"
                aria-invalid={!!errors.consent}
              />
              <span>
                {t('form.consent')}{' '}
                <Link href="/privacy" className="font-bold text-teal-700 underline underline-offset-4" target="_blank">
                  {t('form.privacyLink')}
                </Link>
              </span>
            </label>
            {err('consent')}
          </div>
        </fieldset>

        {state.status === 'error' && state.formError && (
          <p className="mt-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
            <WarningCircleIcon weight="fill" className="size-5 shrink-0" aria-hidden />
            {t(`errors.${state.formError}`, { email })}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className={buttonClasses('ghost', 'md')}>
              <ArrowLeftIcon weight="bold" className="size-4 rtl:-scale-x-100" aria-hidden />
              {t('form.back')}
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className={buttonClasses('gold', 'lg', 'nojs-only')}>
            {t('form.submit')}
          </button>
          {step < 2 ? (
            <button type="button" onClick={next} className={buttonClasses('primary', 'md', 'js-only')}>
              {t('form.next')}
              <ArrowLeftIcon weight="bold" className="size-4 ltr:-scale-x-100" aria-hidden />
            </button>
          ) : (
            <button type="submit" disabled={pending} className={buttonClasses('gold', 'lg', 'min-w-44')}>
              {pending ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-navy-950 border-t-transparent" aria-hidden />
                  {t('form.sending')}
                </>
              ) : (
                t('form.submit')
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
