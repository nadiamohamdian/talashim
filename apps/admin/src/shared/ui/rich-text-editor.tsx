'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Label } from '@talashim/ui';
import { MediaPickerDialog } from '@/features/cms/components/media-picker-dialog';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  minHeight?: number;
  hint?: string;
  mediaFolder?: string;
}

type ImageAlign = 'center' | 'start' | 'end';
type ImageWidth = 'sm' | 'md' | 'lg' | 'full';

const FONT_OPTIONS = [
  { label: 'پیش‌فرض', value: '' },
  { label: 'IBM Plex Arabic', value: 'IBM Plex Sans Arabic, Tahoma, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
];

const SIZE_OPTIONS = [
  { label: 'کوچک', value: '2' },
  { label: 'معمولی', value: '3' },
  { label: 'بزرگ', value: '4' },
  { label: 'خیلی بزرگ', value: '5' },
];

const IMAGE_WIDTH_OPTIONS: Array<{ label: string; value: ImageWidth }> = [
  { label: 'کوچک', value: 'sm' },
  { label: 'متوسط', value: 'md' },
  { label: 'بزرگ', value: 'lg' },
  { label: 'تمام‌عرض', value: 'full' },
];

function ToolbarButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
        active ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]'
      }`}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ensureImageFigure(img: HTMLImageElement): HTMLElement {
  const existing = img.closest('figure.rte-image');
  if (existing instanceof HTMLElement) {
    return existing;
  }

  const figure = document.createElement('figure');
  figure.className = 'rte-image rte-image--align-center rte-image--w-md';
  figure.dataset.align = 'center';
  figure.dataset.width = 'md';
  img.parentNode?.insertBefore(figure, img);
  figure.appendChild(img);
  if (!img.getAttribute('alt')) {
    img.setAttribute('alt', '');
  }
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  return figure;
}

function applyImageLayout(figure: HTMLElement, align: ImageAlign, width: ImageWidth): void {
  figure.className = `rte-image rte-image--align-${align} rte-image--w-${width}`;
  figure.dataset.align = align;
  figure.dataset.width = width;
}

function readImageLayout(figure: HTMLElement): { align: ImageAlign; width: ImageWidth } {
  const align = figure.dataset.align;
  const width = figure.dataset.width;
  return {
    align: align === 'start' || align === 'end' ? align : 'center',
    width: width === 'sm' || width === 'lg' || width === 'full' ? width : 'md',
  };
}

export function RichTextEditor({
  label,
  value,
  onChange,
  required,
  minHeight = 160,
  hint,
  mediaFolder = 'general',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef(value);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageAlign, setImageAlign] = useState<ImageAlign>('center');
  const [imageWidth, setImageWidth] = useState<ImageWidth>('md');

  const syncHtml = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    lastHtmlRef.current = html;
    onChange(html);
  }, [onChange]);

  const exec = useCallback((command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    syncHtml();
  }, [syncHtml]);

  const insertImageFromLibrary = useCallback((url: string) => {
    const safeUrl = escapeHtmlAttribute(url.trim());
    if (!safeUrl) {
      return;
    }

    const html =
      `<figure class="rte-image rte-image--align-center rte-image--w-md" data-align="center" data-width="md">` +
      `<img src="${safeUrl}" alt="" />` +
      `</figure><p><br></p>`;

    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    syncHtml();
    setPickerOpen(false);
  }, [syncHtml]);

  const updateSelectedImageLayout = useCallback(
    (align: ImageAlign, width: ImageWidth) => {
      if (!selectedImage) {
        return;
      }

      const figure = ensureImageFigure(selectedImage);
      applyImageLayout(figure, align, width);
      setImageAlign(align);
      setImageWidth(width);
      syncHtml();
    },
    [selectedImage, syncHtml],
  );

  const removeSelectedImage = useCallback(() => {
    if (!selectedImage) {
      return;
    }

    const figure = selectedImage.closest('figure.rte-image');
    if (figure) {
      figure.remove();
    } else {
      selectedImage.remove();
    }

    setSelectedImage(null);
    syncHtml();
  }, [selectedImage, syncHtml]);

  const handleEditorClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !editorRef.current?.contains(target)) {
      setSelectedImage(null);
      return;
    }

    const figure = ensureImageFigure(target);
    const layout = readImageLayout(figure);
    setSelectedImage(target);
    setImageAlign(layout.align);
    setImageWidth(layout.width);
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === value || lastHtmlRef.current === value) {
      return;
    }
    el.innerHTML = value || '';
    lastHtmlRef.current = value;
  }, [value]);

  return (
    <div>
      <Label>
        {label}
        {required ? ' *' : null}
      </Label>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}

      <div className="mt-2 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)]">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-[var(--surface)] p-2">
          <ToolbarButton title="درشت" onClick={() => exec('bold')}>
            B
          </ToolbarButton>
          <ToolbarButton title="کج" onClick={() => exec('italic')}>
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton title="زیرخط" onClick={() => exec('underline')}>
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton title="خط‌خورده" onClick={() => exec('strikeThrough')}>
            S
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton title="درج تصویر از کتابخانه" onClick={() => setPickerOpen(true)}>
            🖼 تصویر
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" />
          <select
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-xs"
            defaultValue=""
            onChange={(e) => exec('fontName', e.target.value)}
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-xs"
            defaultValue="3"
            onChange={(e) => exec('fontSize', e.target.value)}
          >
            {SIZE_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            رنگ
            <input
              type="color"
              className="h-7 w-8 cursor-pointer rounded border border-border"
              onChange={(e) => exec('foreColor', e.target.value)}
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            پس‌زمینه
            <input
              type="color"
              className="h-7 w-8 cursor-pointer rounded border border-border"
              onChange={(e) => exec('hiliteColor', e.target.value)}
            />
          </label>
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton title="لیست نشانه‌دار" onClick={() => exec('insertUnorderedList')}>
            • لیست
          </ToolbarButton>
          <ToolbarButton title="لیست شماره‌دار" onClick={() => exec('insertOrderedList')}>
            1. لیست
          </ToolbarButton>
          <ToolbarButton title="راست‌چین" onClick={() => exec('justifyRight')}>
            راست
          </ToolbarButton>
          <ToolbarButton title="وسط‌چین" onClick={() => exec('justifyCenter')}>
            وسط
          </ToolbarButton>
          <ToolbarButton title="پاک‌سازی" onClick={() => exec('removeFormat')}>
            پاک
          </ToolbarButton>
        </div>

        {selectedImage ? (
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-[var(--surface)] px-2 py-2">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">چیدمان تصویر:</span>
            <ToolbarButton
              title="وسط‌چین — متن زیر تصویر"
              active={imageAlign === 'center'}
              onClick={() => updateSelectedImageLayout('center', imageWidth)}
            >
              وسط
            </ToolbarButton>
            <ToolbarButton
              title="راست — متن دور تصویر می‌پیچد"
              active={imageAlign === 'end'}
              onClick={() => updateSelectedImageLayout('end', imageWidth)}
            >
              راست
            </ToolbarButton>
            <ToolbarButton
              title="چپ — متن دور تصویر می‌پیچد"
              active={imageAlign === 'start'}
              onClick={() => updateSelectedImageLayout('start', imageWidth)}
            >
              چپ
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-border" />
            {IMAGE_WIDTH_OPTIONS.map((option) => (
              <ToolbarButton
                key={option.value}
                title={`عرض ${option.label}`}
                active={imageWidth === option.value}
                onClick={() => updateSelectedImageLayout(imageAlign, option.value)}
              >
                {option.label}
              </ToolbarButton>
            ))}
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarButton title="حذف تصویر" onClick={removeSelectedImage}>
              حذف
            </ToolbarButton>
          </div>
        ) : null}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          className="rte-editor prose prose-sm max-w-none px-4 py-3 text-sm leading-8 text-foreground outline-none"
          style={{ minHeight }}
          onClick={handleEditorClick}
          onInput={syncHtml}
        />
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={insertImageFromLibrary}
        folder={mediaFolder}
        title="درج تصویر از کتابخانه"
      />
    </div>
  );
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
