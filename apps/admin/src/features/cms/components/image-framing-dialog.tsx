'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Button } from '@sadafgold/ui';
import { uploadMediaImage } from '../api/cms-api';
import {
  cropImageToFrame,
  DEFAULT_IMAGE_FRAME_FOCUS,
  type ImageFrameFocus,
} from '../lib/crop-image-to-frame';
import type { ImageFrameSpec } from '../lib/image-frame-spec';
import { getApiErrorMessage } from '@/shared/api/axios-client';

interface ImageFramingDialogProps {
  open: boolean;
  imageUrl: string;
  frame: ImageFrameSpec;
  folder?: string;
  title?: string;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function ImageFramingDialog({
  open,
  imageUrl,
  frame,
  folder = 'general',
  title = 'تنظیم جایگاه تصویر',
  onClose,
  onConfirm,
}: ImageFramingDialogProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragOriginRef = useRef<{ x: number; y: number; focus: ImageFrameFocus } | null>(null);
  const [focus, setFocus] = useState<ImageFrameFocus>(DEFAULT_IMAGE_FRAME_FOCUS);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFocus(DEFAULT_IMAGE_FRAME_FOCUS);
      setError(null);
    }
  }, [open, imageUrl]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragOriginRef.current = {
        x: event.clientX,
        y: event.clientY,
        focus: { ...focus },
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [focus],
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOriginRef.current;
    const frameElement = frameRef.current;
    if (!origin || !frameElement) {
      return;
    }

    const rect = frameElement.getBoundingClientRect();
    const deltaX = event.clientX - origin.x;
    const deltaY = event.clientY - origin.y;
    const sensitivity = 0.35;

    setFocus({
      x: clamp(origin.focus.x - (deltaX / rect.width) * 100 * sensitivity, 0, 100),
      y: clamp(origin.focus.y - (deltaY / rect.height) * 100 * sensitivity, 0, 100),
    });
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragOriginRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleConfirm = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const croppedBlob = await cropImageToFrame(imageUrl, frame, focus);
      const file = new File([croppedBlob], `framed-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const asset = await uploadMediaImage(file, { folder });
      onConfirm(asset.url);
      onClose();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, 'ذخیره تصویر برش‌خورده ناموفق بود.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  const frameLabel = frame.label ?? 'قاب تصویر';
  const dimensionLabel = `${frame.width.toLocaleString('fa-IR')} × ${frame.height.toLocaleString('fa-IR')} px`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--secondary)]/55 backdrop-blur-sm"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--card)] shadow-[var(--shadow-dialog)] sm:rounded-[var(--radius-panel)]"
      >
        <div className="border-b border-border bg-[var(--surface)] px-5 py-4">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            تصویر را داخل کادر بکشید تا جایگاه دقیق نمایش تنظیم شود. با تأیید، نسخه برش‌خورده در
            کتابخانه ذخیره می‌شود — برای استفاده مستقیم از همان فایل، از دکمه «انتخاب از کتابخانه»
            استفاده کنید.
          </p>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
            <span className="font-medium text-foreground">{frameLabel}</span>
            <span dir="ltr" className="rounded-full border border-border bg-[var(--surface)] px-3 py-1 font-mono">
              {dimensionLabel}
            </span>
          </div>

          <div className="image-framing-workspace">
            <div
              ref={frameRef}
              className="image-framing-frame"
              style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="پیش‌نمایش برش"
                className="image-framing-image"
                style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
                draggable={false}
              />
              <div className="image-framing-frame-overlay" aria-hidden="true">
                <span className="image-framing-frame-label">{dimensionLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFocus(DEFAULT_IMAGE_FRAME_FOCUS)}
            >
              بازنشانی موقعیت
            </Button>
          </div>

          {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-[var(--surface)] px-5 py-4">
          <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
            انصراف
          </Button>
          <Button type="button" disabled={isSaving} onClick={() => void handleConfirm()}>
            {isSaving ? 'در حال ذخیره…' : 'تأیید و ذخیره تصویر'}
          </Button>
        </div>
      </div>
    </div>
  );
}
