'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Label } from '@sadafgold/ui';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  minHeight?: number;
  hint?: string;
}

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

export function RichTextEditor({
  label,
  value,
  onChange,
  required,
  minHeight = 160,
  hint,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef(value);

  const exec = useCallback((command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtmlRef.current = html;
      onChange(html);
    }
  }, [onChange]);

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

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          className="prose prose-sm max-w-none px-4 py-3 text-sm leading-8 text-foreground outline-none"
          style={{ minHeight }}
          onInput={() => {
            const html = editorRef.current?.innerHTML ?? '';
            lastHtmlRef.current = html;
            onChange(html);
          }}
        />
      </div>
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
