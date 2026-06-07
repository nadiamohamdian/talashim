'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@talashim/ui';
import type { CmsSeoSettingsDto } from '@talashim/types';
import { fetchSeoSettings, updateSeoSettings } from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { CmsPageShell } from './cms-page-shell';
import { ImageUrlField } from './image-url-field';
import { validateLibraryImageUrl } from '../lib/validate-library-image';

function validateSeoForm(form: Omit<CmsSeoSettingsDto, 'updatedAt'>): string | null {
  if (form.siteTitle.trim().length < 2) {
    return 'عنوان سایت باید حداقل ۲ کاراکتر باشد.';
  }
  if (form.siteDescription.trim().length < 10) {
    return 'توضیحات متا باید حداقل ۱۰ کاراکتر باشد.';
  }
  const ogImage = form.defaultOgImageUrl?.trim() ?? '';
  if (ogImage) {
    const imageError = validateLibraryImageUrl(ogImage, 'تصویر Open Graph');
    if (imageError) {
      return imageError;
    }
  }
  const gaId = form.googleAnalyticsId?.trim() ?? '';
  if (gaId && !/^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(gaId)) {
    return 'شناسه Google Analytics نامعتبر است (مثال: G-XXXXXXXX).';
  }
  return null;
}

export function SeoPanel() {
  const queryClient = useQueryClient();
  const hydratedRef = useRef(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.seo,
    queryFn: fetchSeoSettings,
  });

  const [form, setForm] = useState<Omit<CmsSeoSettingsDto, 'updatedAt'> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (data && !hydratedRef.current) {
      hydratedRef.current = true;
      setForm({
        siteTitle: data.siteTitle,
        siteDescription: data.siteDescription,
        defaultOgImageUrl: data.defaultOgImageUrl,
        robotsIndex: data.robotsIndex,
        googleAnalyticsId: data.googleAnalyticsId,
        extraMeta: data.extraMeta,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: updateSeoSettings,
    onSuccess: () => {
      setSaveError(null);
      setSaveSuccess(true);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.cms.seo });
    },
    onError: (error: unknown) => {
      setSaveSuccess(false);
      setSaveError(getApiErrorMessage(error, 'ذخیره SEO ناموفق بود'));
    },
  });

  if (isLoading || !form) {
    return (
      <CmsPageShell routeId="cms.seo">
        <Skeleton className="h-64 w-full" />
      </CmsPageShell>
    );
  }

  if (isError) {
    return (
      <CmsPageShell routeId="cms.seo">
        <p className="text-[var(--error)]">بارگذاری SEO ناموفق بود.</p>
      </CmsPageShell>
    );
  }

  return (
    <CmsPageShell routeId="cms.seo">
      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <div>
          <Label>عنوان سایت</Label>
          <Input
            className="mt-1"
            value={form.siteTitle}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, siteTitle: e.target.value });
            }}
          />
          <p className="mt-1 text-xs text-muted">در تب مرورگر و نتایج جستجو نمایش داده می‌شود.</p>
        </div>
        <div>
          <Label>توضیحات متا (description)</Label>
          <textarea
            className="mt-1 min-h-[100px] w-full rounded-[var(--radius-xl)] border border-border p-3 text-sm"
            value={form.siteDescription}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, siteDescription: e.target.value });
            }}
          />
        </div>
        <ImageUrlField
          label="تصویر Open Graph پیش‌فرض"
          hint="از کتابخانه رسانه انتخاب کنید."
          value={form.defaultOgImageUrl ?? ''}
          onChange={(url) => {
            setSaveSuccess(false);
            setForm({ ...form, defaultOgImageUrl: url || null });
          }}
          folder="cms"
        />
        <div>
          <Label>شناسه Google Analytics</Label>
          <Input
            className="mt-1 font-mono text-sm"
            dir="ltr"
            value={form.googleAnalyticsId ?? ''}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, googleAnalyticsId: e.target.value || null });
            }}
            placeholder="G-XXXXXXXX"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="robots-index"
            type="checkbox"
            checked={form.robotsIndex}
            onChange={(e) => {
              setSaveSuccess(false);
              setForm({ ...form, robotsIndex: e.target.checked });
            }}
          />
          <Label htmlFor="robots-index">اجازه ایندکس (robots index)</Label>
        </div>
      </Card>

      {saveError ? (
        <p className="text-sm text-[var(--error)]">{saveError}</p>
      ) : null}
      {saveSuccess ? (
        <p className="text-sm text-[var(--success,#2d6a4f)]">
          تنظیمات SEO ذخیره شد و روی سایت اعمال می‌شود.
        </p>
      ) : null}

      <Button
        disabled={save.isPending}
        onClick={() => {
          const validationError = validateSeoForm(form);
          if (validationError) {
            setSaveSuccess(false);
            setSaveError(validationError);
            return;
          }
          setSaveError(null);
          save.mutate(form);
        }}
      >
        {save.isPending ? 'در حال ذخیره…' : 'ذخیره SEO'}
      </Button>

      {data?.updatedAt ? (
        <p className="text-xs text-muted">
          آخرین به‌روزرسانی: {formatPersianDateTime(data.updatedAt)}
        </p>
      ) : null}
    </CmsPageShell>
  );
}
