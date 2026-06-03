'use client';

import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Label } from '@talashim/ui';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { uploadMediaImage } from '../api/cms-api';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

interface ImageUrlFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  previewAlt?: string;
  required?: boolean;
  inputClassName?: string;
}

export function ImageUrlField({
  label,
  hint,
  value,
  onChange,
  folder = 'products',
  previewAlt = 'پیش‌نمایش',
  required,
  inputClassName,
}: ImageUrlFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: (file: File) => uploadMediaImage(file, { folder }),
    onSuccess: (asset) => onChange(asset.url),
  });

  return (
    <div>
      <Label>
        {label}
        {required ? ' *' : null}
      </Label>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
        <Input
          className={inputClassName ?? 'min-w-0 flex-1'}
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... یا آپلود فایل"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 px-4 text-sm"
          disabled={upload.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {upload.isPending ? 'در حال آپلود…' : 'آپلود تصویر'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              upload.mutate(file);
            }
            e.target.value = '';
          }}
        />
      </div>
      {upload.isError ? (
        <p className="mt-2 text-xs text-rose-600">{getApiErrorMessage(upload.error)}</p>
      ) : null}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={previewAlt}
          className="mt-3 aspect-square max-h-40 rounded-xl object-cover"
        />
      ) : null}
    </div>
  );
}
