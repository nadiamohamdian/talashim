'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input, Label } from '@talashim/ui';
import type { AdminBlogCategoryDto, AdminBlogPostDto } from '@talashim/types';
import type { UpsertBlogPostPayload } from '../api/cms-api';
import { ImageUrlField } from './image-url-field';
import { RichTextEditor } from '@/shared/ui/rich-text-editor';
import { PersianDateTimePicker } from '@/shared/ui/persian-datetime-picker';
import { selectFieldClass } from '../lib/labels';
import { validateLibraryImageUrl } from '../lib/validate-library-image';

const emptyPayload = (): UpsertBlogPostPayload => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  isPublished: true,
  sortOrder: 0,
  publishedAt: new Date().toISOString(),
});

interface PostEditorFormProps {
  categories: AdminBlogCategoryDto[];
  initial?: AdminBlogPostDto | null;
  excludeFaq?: boolean;
  onSave: (payload: UpsertBlogPostPayload) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  saveError?: string | null;
}

export function PostEditorForm({
  categories,
  initial,
  excludeFaq = true,
  onSave,
  onCancel,
  saving,
  saveError,
}: PostEditorFormProps) {
  const [form, setForm] = useState<UpsertBlogPostPayload>(emptyPayload());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        slug: initial.slug,
        excerpt: initial.excerpt,
        content: initial.content,
        coverImageUrl: initial.coverImageUrl,
        categoryId: initial.categoryId ?? undefined,
        publishedAt: initial.publishedAt,
        isPublished: initial.isPublished,
        sortOrder: initial.sortOrder,
      });
    } else {
      setForm(emptyPayload());
    }
  }, [initial]);

  const filteredCategories = excludeFaq
    ? categories.filter((c) => c.slug !== 'faq')
    : categories.filter((c) => c.slug === 'faq');

  return (
    <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
      <p className="text-sm font-medium text-foreground">
        {initial ? 'ویرایش محتوا' : 'محتوای جدید'}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>عنوان</Label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div>
          <Label>slug</Label>
          <Input
            className="mt-1 font-mono text-sm"
            dir="ltr"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </div>
        {!excludeFaq ? null : (
          <div>
            <Label>دسته‌بندی</Label>
            <select
              className={selectFieldClass}
              value={form.categoryId ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  categoryId: e.target.value || undefined,
                }))
              }
            >
              <option value="">بدون دسته</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <PersianDateTimePicker
            label="تاریخ انتشار"
            value={form.publishedAt ?? new Date().toISOString()}
            onChange={(iso) => setForm((f) => ({ ...f, publishedAt: iso }))}
          />
        </div>
        <div>
          <Label>ترتیب نمایش</Label>
          <Input
            className="mt-1"
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
            }
          />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <input
            id="post-published"
            type="checkbox"
            checked={form.isPublished ?? true}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          />
          <Label htmlFor="post-published">منتشر شده</Label>
        </div>
        <div className="md:col-span-2">
          <Label>خلاصه</Label>
          <Input
            className="mt-1"
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <ImageUrlField
            label="تصویر کاور"
            hint="فقط از کتابخانه رسانه — بدون لینک خارجی."
            value={form.coverImageUrl}
            onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
            folder="blog"
            required
          />
        </div>
        <div className="md:col-span-2">
          <RichTextEditor
            label="متن کامل"
            hint="محتوای مقاله — تصاویر داخل متن را از دکمه «درج تصویر» در کتابخانه انتخاب کنید."
            value={form.content}
            onChange={(content) => setForm((f) => ({ ...f, content }))}
            minHeight={220}
            mediaFolder="blog"
          />
        </div>
      </div>
      {validationError ? (
        <p className="text-sm text-[var(--error)]">{validationError}</p>
      ) : null}
      {saveError ? <p className="text-sm text-[var(--error)]">{saveError}</p> : null}
      <div className="flex gap-2">
        <Button
          disabled={saving}
          onClick={() => {
            const imageError = validateLibraryImageUrl(form.coverImageUrl, 'تصویر کاور');
            if (imageError) {
              setValidationError(imageError);
              return;
            }
            setValidationError(null);
            void onSave(form).catch(() => {
              // Parent mutation surfaces API validation errors via saveError.
            });
          }}
        >
          {saving ? 'در حال ذخیره…' : 'ذخیره'}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          انصراف
        </Button>
      </div>
    </Card>
  );
}
