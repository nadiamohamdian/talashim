'use client';

import { useState } from 'react';
import { Button, Label } from '@sadafgold/ui';
import { MediaPickerDialog } from './media-picker-dialog';

interface ImageUrlFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  previewAlt?: string;
  required?: boolean;
}

export function ImageUrlField({
  label,
  hint,
  value,
  onChange,
  folder = 'products',
  previewAlt = 'پیش‌نمایش',
  required,
}: ImageUrlFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <Label>
        {label}
        {required ? ' *' : null}
      </Label>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-gold" onClick={() => setPickerOpen(true)}>
          {value ? 'تغییر تصویر' : 'انتخاب از کتابخانه'}
        </button>
        {value ? (
          <Button type="button" variant="outline" className="text-rose-700" onClick={() => onChange('')}>
            حذف
          </Button>
        ) : null}
      </div>

      {value ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-nude-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={previewAlt}
            className="aspect-square max-h-40 rounded-lg object-cover"
          />
          <p className="mt-2 truncate font-mono text-[10px] text-stone-500" dir="ltr">
            {value}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-stone-400">
          تصویر را از کتابخانه رسانه انتخاب کنید —{' '}
          <a href="/media" className="font-semibold text-amber-700 hover:underline">
            مدیریت کتابخانه
          </a>
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
