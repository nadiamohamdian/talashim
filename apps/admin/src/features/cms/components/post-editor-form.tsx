'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input, Label } from '@sadafgold/ui';
import type { AdminBlogCategoryDto, AdminBlogPostDto } from '@sadafgold/types';
import type { UpsertBlogPostPayload } from '../api/cms-api';
import { selectFieldClass } from '../lib/labels';

const emptyPayload = (): UpsertBlogPostPayload => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl:
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
  isPublished: true,
  sortOrder: 0,
  publishedAt: new Date().toISOString().slice(0, 10),
});

interface PostEditorFormProps {
  categories: AdminBlogCategoryDto[];
  initial?: AdminBlogPostDto | null;
  excludeFaq?: boolean;
  onSave: (payload: UpsertBlogPostPayload) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function PostEditorForm({
  categories,
  initial,
  excludeFaq = true,
  onSave,
  onCancel,
  saving,
}: PostEditorFormProps) {
  const [form, setForm] = useState<UpsertBlogPostPayload>(emptyPayload());

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        slug: initial.slug,
        excerpt: initial.excerpt,
        content: initial.content,
        coverImageUrl: initial.coverImageUrl,
        categoryId: initial.categoryId ?? undefined,
        publishedAt: initial.publishedAt.slice(0, 10),
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
    <Card className="space-y-4 border-border bg-white p-6">
      <p className="text-sm font-medium text-stone-900">
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
          <Label>تاریخ انتشار</Label>
          <Input
            className="mt-1"
            type="date"
            value={form.publishedAt?.slice(0, 10) ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
          />
        </div>
        <div>
          <Label>ترتیب نمایش</Label>
          <Input
            className="mt-1"
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
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
          <Label>آدرس تصویر کاور</Label>
          <Input
            className="mt-1 font-mono text-xs"
            dir="ltr"
            value={form.coverImageUrl}
            onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <Label>متن کامل</Label>
          <textarea
            className="mt-1 min-h-[160px] w-full rounded-2xl border border-border bg-white p-3 text-sm"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button disabled={saving} onClick={() => void onSave(form)}>
          {saving ? 'در حال ذخیره…' : 'ذخیره'}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel}>
          انصراف
        </Button>
      </div>
    </Card>
  );
}
