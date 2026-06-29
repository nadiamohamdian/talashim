'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Label } from '@sadafgold/ui';
import { MediaPickerDialog } from './media-picker-dialog';
import { ImageFramingDialog } from './image-framing-dialog';
import { consumeMediaPickerResult } from '../lib/media-picker-session';
import {
  resolveImageFrame,
  type ImageFrameSpec,
} from '../lib/image-frame-spec';

interface ImageUrlFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  previewAlt?: string;
  previewClassName?: string;
  frame?: ImageFrameSpec;
  enableFraming?: boolean;
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
  frame,
  enableFraming = true,
  required,
}: ImageUrlFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [framingOpen, setFramingOpen] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);

  const resolvedFrame = useMemo(
    () => resolveImageFrame(frame, previewClassName),
    [frame, previewClassName],
  );

  const frameAspectClass = `aspect-[${resolvedFrame.width}/${resolvedFrame.height}]`;

  const handleImagePicked = useCallback(
    (url: string) => {
      if (enableFraming) {
        setPendingImageUrl(url);
        setFramingOpen(true);
        return;
      }

      onChange(url);
    },
    [enableFraming, onChange],
  );

  useEffect(() => {
    const picked = consumeMediaPickerResult();
    if (picked) {
      handleImagePicked(picked);
    }
  }, [handleImagePicked]);

  useEffect(() => {
    const onFocus = () => {
      const picked = consumeMediaPickerResult();
      if (picked) {
        handleImagePicked(picked);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [handleImagePicked]);

  const openFramingForCurrentValue = () => {
    if (!value) {
      return;
    }

    setPendingImageUrl(value);
    setFramingOpen(true);
  };

  return (
    <div>
      <Label>
        {label}
        {required ? ' *' : null}
      </Label>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        ابعاد نمایش:{' '}
        <span dir="ltr" className="font-mono">
          {resolvedFrame.width}×{resolvedFrame.height}px
        </span>
        {resolvedFrame.label ? ` — ${resolvedFrame.label}` : null}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-gold" onClick={() => setPickerOpen(true)}>
          {value ? 'تغییر تصویر' : 'انتخاب از کتابخانه'}
        </button>
        {value && enableFraming ? (
          <Button type="button" variant="outline" onClick={openFramingForCurrentValue}>
            تنظیم جایگاه در کادر
          </Button>
        ) : null}
        {value ? (
          <Button type="button" variant="outline" className="text-[var(--error)]" onClick={() => onChange('')}>
            حذف
          </Button>
        ) : null}
      </div>

      {value ? (
        <div className="mt-3 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-[var(--surface)] p-2">
          <div
            className={`image-url-field-frame ${frameAspectClass} w-full max-w-3xl overflow-hidden rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)]`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={previewAlt}
              className={previewClassName ?? 'h-full w-full object-cover'}
            />
          </div>
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
        onSelect={handleImagePicked}
        folder={folder}
        title={`انتخاب ${label}`}
      />

      {pendingImageUrl ? (
        <ImageFramingDialog
          open={framingOpen}
          imageUrl={pendingImageUrl}
          frame={resolvedFrame}
          folder={folder}
          title={`تنظیم ${label}`}
          onClose={() => {
            setFramingOpen(false);
            setPendingImageUrl(null);
          }}
          onConfirm={(url) => {
            onChange(url);
            setFramingOpen(false);
            setPendingImageUrl(null);
          }}
        />
      ) : null}
    </div>
  );
}
