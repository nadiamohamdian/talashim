'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, Input, Label } from '@talashim/ui';
import type { AdminBlogPostDto } from '@talashim/types';
import { RichTextEditor } from '@/shared/ui/rich-text-editor';
import type { UpsertFaqPayload } from '../api/cms-api';

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function suggestSlug(question: string): string {
  const base = question
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  if (base.length >= 2) {
    return `faq-${base}`;
  }
  return `faq-${Date.now()}`;
}

function emptyForm(): UpsertFaqPayload {
  return {
    question: '',
    answer: '',
    slug: '',
    isPublished: true,
    sortOrder: 0,
  };
}

interface FaqEditorFormProps {
  initial?: AdminBlogPostDto | null;
  onSave: (payload: UpsertFaqPayload) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  errorMessage?: string | null;
}

export function FaqEditorForm({
  initial,
  onSave,
  onCancel,
  saving,
  errorMessage,
}: FaqEditorFormProps) {
  const [form, setForm] = useState<UpsertFaqPayload>(emptyForm());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        question: initial.title,
        answer: initial.content,
        slug: initial.slug,
        isPublished: initial.isPublished,
        sortOrder: initial.sortOrder,
      });
    } else {
      setForm(emptyForm());
    }
    setValidationError(null);
  }, [initial]);

  const handleSubmit = async () => {
    const question = form.question.trim();
    const answerPlain = stripHtml(form.answer);

    if (question.length < 2) {
      setValidationError('سوال باید حداقل ۲ کاراکتر باشد.');
      return;
    }
    if (answerPlain.length < 2) {
      setValidationError('پاسخ باید حداقل ۲ کاراکتر باشد.');
      return;
    }

    const slug = form.slug.trim() || suggestSlug(question);
    if (slug.length < 2) {
      setValidationError('شناسه (slug) باید حداقل ۲ کاراکتر باشد.');
      return;
    }

    setValidationError(null);
    await onSave({
      ...form,
      question,
      slug,
    });
  };

  return (
    <Card className="space-y-5 p-6">
      <div>
        <p className="text-h3 text-base">{initial ? 'ویرایش سوال' : 'سوال جدید'}</p>
        <p className="mt-1 text-caption">سوال در عنوان و پاسخ در متن غنی ذخیره می‌شود.</p>
      </div>

      {validationError ? <Alert variant="destructive">{validationError}</Alert> : null}
      {errorMessage ? <Alert variant="destructive">{errorMessage}</Alert> : null}

      <div className="field-group">
        <Label htmlFor="faq-question">سوال</Label>
        <Input
          id="faq-question"
          value={form.question}
          placeholder="مثلاً: ارسال طلا چقدر طول می‌کشد؟"
          onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
        />
      </div>

      <div className="field-group">
        <RichTextEditor
          label="پاسخ"
          hint="متن کامل پاسخ — در صفحه /faq نمایش داده می‌شود."
          value={form.answer}
          onChange={(answer) => setForm((f) => ({ ...f, answer }))}
          minHeight={200}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field-group">
          <Label htmlFor="faq-slug">slug (لاتین)</Label>
          <Input
            id="faq-slug"
            dir="ltr"
            className="font-mono text-sm"
            value={form.slug}
            placeholder={suggestSlug(form.question || 'faq-item')}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <p className="field-hint">در صورت خالی بودن، به‌صورت خودکار ساخته می‌شود.</p>
        </div>
        <div className="field-group">
          <Label htmlFor="faq-sort">ترتیب نمایش</Label>
          <Input
            id="faq-sort"
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
            }
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={form.isPublished ?? true}
          onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          className="size-4 rounded border-[var(--border)] accent-[var(--primary)]"
        />
        <span className="text-sm text-foreground">نمایش در فروشگاه (/faq)</span>
      </label>

      <div className="flex gap-2 border-t border-[var(--divider)] pt-4">
        <Button disabled={saving} onClick={() => void handleSubmit()}>
          {saving ? 'در حال ذخیره…' : 'ذخیره سوال'}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          انصراف
        </Button>
      </div>
    </Card>
  );
}
