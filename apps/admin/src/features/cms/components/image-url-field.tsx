'use client';

import { useEffect, useState } from 'react';
import { Button, Label } from '@sadafgold/ui';
import { MediaPickerDialog } from './media-picker-dialog';
import { consumeMediaPickerResult } from '../lib/media-picker-session';

interface ImageUrlFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  previewAlt?: string;
  previewClassName?: string;
  required?: boolean;
}

export function ImageUrlField({
  label,
  hint,
  value,
  onChange,
  folder = 'products',
  previewAlt = 'پیش‌نمایش',
  previewClassName,
  required,
}: ImageUrlFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const picked = consumeMediaPickerResult();
    if (picked) {
      onChange(picked);
    }
  }, [onChange]);

  useEffect(() => {
    const onFocus = () => {
      const picked = consumeMediaPickerResult();
      if (picked) {
        onChange(picked);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [onChange]);

  return (
    <div>
      <Label>
        {label}
        {required ? ' *' : null}
      </Label>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-gold" onClick={() => setPickerOpen(true)}>
          {value ? 'تغییر تصویر' : 'انتخاب از کتابخانه'}
        </button>
        {value ? (
          <Button type="button" variant="outline" className="text-[var(--error)]" onClick={() => onChange('')}>
            حذف
          </Button>
        ) : null}
      </div>

      {value ? (
        <div className="mt-3 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-[var(--surface)] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={previewAlt}
            className={previewClassName ?? 'aspect-square max-h-40 rounded-lg object-cover'}
          />
          <p className="mt-2 truncate font-mono text-[10px] text-muted" dir="ltr">
            {value}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">
          تمام تصاویر سایت فقط از{' '}
          <a
            href={`/media?picker=1&folder=${encodeURIComponent(folder)}`}
            className="font-semibold text-[var(--warning)] hover:underline"
          >
            کتابخانه رسانه
          </a>{' '}
          انتخاب می‌شوند — لینک خارجی یا Unsplash مجاز نیست.
        </p>
      )}

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        folder={folder}
        title={`انتخاب ${label}`}
      />
    </div>
  );
}
