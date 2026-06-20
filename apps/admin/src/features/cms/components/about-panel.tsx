'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@talashim/ui';
import type { CmsAboutPageDto, CmsAboutPageValue } from '@talashim/types';
import { fetchAboutPageCms, updateAboutPageCms } from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { CmsPageShell } from './cms-page-shell';
import { ImageUrlField } from './image-url-field';
import { validateLibraryImageUrl } from '../lib/validate-library-image';

type AboutFormState = Omit<CmsAboutPageDto, 'updatedAt'>;

function validateAboutForm(form: AboutFormState): string | null {
  if (form.meta.title.trim().length < 2) {
    return 'عنوان SEO باید حداقل ۲ کاراکتر باشد.';
  }
  if (form.meta.description.trim().length < 10) {
    return 'توضیحات SEO باید حداقل ۱۰ کاراکتر باشد.';
  }
  if (form.copy.heroTitle.trim().length < 2) {
    return 'عنوان صفحه باید حداقل ۲ کاراکتر باشد.';
  }
  if (form.copy.intro.trim().length < 10) {
    return 'متن معرفی باید حداقل ۱۰ کاراکتر باشد.';
  }
  if (form.copy.storyTitle.trim().length < 2) {
    return 'عنوان داستان برند باید حداقل ۲ کاراکتر باشد.';
  }
  if (form.copy.storyBody.trim().length < 20) {
    return 'متن داستان برند باید حداقل ۲۰ کاراکتر باشد.';
  }
  if (form.copy.valuesTitle.trim().length < 2) {
    return 'عنوان بخش ارزش‌ها باید حداقل ۲ کاراکتر باشد.';
  }

  const decor = form.decorImageUrl.trim();
  if (!decor) {
    return 'تصویر دکور صفحه الزامی است.';
  }
  if (!decor.startsWith('/images/')) {
    const imageError = validateLibraryImageUrl(decor, 'تصویر دکور');
    if (imageError) {
      return imageError;
    }
  }

  for (const value of form.values) {
    if (value.label.trim().length < 2) {
      return `عنوان ارزش «${value.label || value.key}» باید حداقل ۲ کاراکتر باشد.`;
    }
  }

  return null;
}

const VALUE_LABELS: Record<CmsAboutPageValue['key'], string> = {
  authenticity: 'اصالت و کیفیت',
  design: 'طراحی به‌روز',
  trust: 'تجربه خرید مطمئن',
  satisfaction: 'رضایت مشتری',
};

export function AboutPanel() {
  const queryClient = useQueryClient();
  const hydratedRef = useRef(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.about,
    queryFn: fetchAboutPageCms,
  });

  const [form, setForm] = useState<AboutFormState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (data && !hydratedRef.current) {
      hydratedRef.current = true;
      setForm({
        meta: data.meta,
        copy: data.copy,
        decorImageUrl: data.decorImageUrl,
        values: data.values.map((value) => ({ ...value })),
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: updateAboutPageCms,
    onSuccess: () => {
      setSaveError(null);
      setSaveSuccess(true);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.cms.about });
    },
    onError: (error: unknown) => {
      setSaveSuccess(false);
      setSaveError(getApiErrorMessage(error, 'ذخیره صفحه درباره ما ناموفق بود'));
    },
  });

  const updateValueLabel = (key: CmsAboutPageValue['key'], label: string) => {
    setSaveSuccess(false);
    setForm((current) =>
      current
        ? {
            ...current,
            values: current.values.map((value) =>
              value.key === key ? { ...value, label } : value,
            ),
          }
        : current,
    );
  };

  if (isLoading || !form) {
    return (
      <CmsPageShell routeId="cms.about">
        <Skeleton className="h-64 w-full" />
      </CmsPageShell>
    );
  }

  if (isError) {
    return (
      <CmsPageShell routeId="cms.about">
        <p className="text-[var(--error)]">بارگذاری صفحه درباره ما ناموفق بود.</p>
      </CmsPageShell>
    );
  }

  return (
    <CmsPageShell routeId="cms.about">
      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">SEO</h2>
        <div>
          <Label>عنوان صفحه (title)</Label>
          <Input
            className="mt-1"
            value={form.meta.title}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, meta: { ...form.meta, title: e.target.value } });
            }}
          />
        </div>
        <div>
          <Label>توضیحات متا (description)</Label>
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-[var(--radius-xl)] border border-border p-3 text-sm"
            value={form.meta.description}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, meta: { ...form.meta, description: e.target.value } });
            }}
          />
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">محتوای صفحه</h2>
        <div>
          <Label>عنوان اصلی</Label>
          <Input
            className="mt-1"
            value={form.copy.heroTitle}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, copy: { ...form.copy, heroTitle: e.target.value } });
            }}
          />
        </div>
        <div>
          <Label>متن معرفی</Label>
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-[var(--radius-xl)] border border-border p-3 text-sm"
            value={form.copy.intro}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, copy: { ...form.copy, intro: e.target.value } });
            }}
          />
        </div>
        <div>
          <Label>عنوان داستان برند</Label>
          <Input
            className="mt-1"
            value={form.copy.storyTitle}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, copy: { ...form.copy, storyTitle: e.target.value } });
            }}
          />
        </div>
        <div>
          <Label>متن داستان برند</Label>
          <textarea
            className="mt-1 min-h-[160px] w-full rounded-[var(--radius-xl)] border border-border p-3 text-sm"
            value={form.copy.storyBody}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, copy: { ...form.copy, storyBody: e.target.value } });
            }}
          />
        </div>
        <div>
          <Label>عنوان بخش ارزش‌ها</Label>
          <Input
            className="mt-1"
            value={form.copy.valuesTitle}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, copy: { ...form.copy, valuesTitle: e.target.value } });
            }}
          />
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">ارزش‌های برند</h2>
        <p className="text-xs text-muted">آیکون‌ها ثابت هستند؛ فقط عنوان هر کارت قابل ویرایش است.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {form.values.map((value) => (
            <div key={value.key}>
              <Label>{VALUE_LABELS[value.key]}</Label>
              <Input
                className="mt-1"
                value={value.label}
                onChange={(e) => updateValueLabel(value.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">تصویر دکور</h2>
        <ImageUrlField
          label="تصویر تزئینی صفحه"
          hint="از کتابخانه رسانه انتخاب کنید یا تصویر پیش‌فرض فعلی را نگه دارید."
          value={form.decorImageUrl}
          onChange={(url) => {
            setSaveSuccess(false);
            setForm({ ...form, decorImageUrl: url });
          }}
          folder="general"
        />
      </Card>

      {saveError ? <p className="text-sm text-[var(--error)]">{saveError}</p> : null}
      {saveSuccess ? (
        <p className="text-sm text-[var(--success,#2d6a4f)]">
          محتوای صفحه درباره ما ذخیره شد و روی سایت اعمال می‌شود.
        </p>
      ) : null}

      <Button
        disabled={save.isPending}
        onClick={() => {
          const validationError = validateAboutForm(form);
          if (validationError) {
            setSaveSuccess(false);
            setSaveError(validationError);
            return;
          }
          setSaveError(null);
          save.mutate(form);
        }}
      >
        {save.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
      </Button>

      {data?.updatedAt ? (
        <p className="text-xs text-muted">
          آخرین به‌روزرسانی: {formatPersianDateTime(data.updatedAt)}
        </p>
      ) : null}
    </CmsPageShell>
  );
}
