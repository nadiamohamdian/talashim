'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@talashim/ui';
import type { CmsSeoSettingsDto } from '@talashim/types';
import { fetchSeoSettings, updateSeoSettings } from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { CmsPageShell } from './cms-page-shell';
import { ImageUrlField } from './image-url-field';

export function SeoPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.seo,
    queryFn: fetchSeoSettings,
  });

  const [form, setForm] = useState<Omit<CmsSeoSettingsDto, 'updatedAt'> | null>(null);

  useEffect(() => {
    if (data) {
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
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.cms.seo });
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
            onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
          />
        </div>
        <div>
          <Label>توضیحات متا (description)</Label>
          <textarea
            className="mt-1 min-h-[100px] w-full rounded-[var(--radius-xl)] border border-border p-3 text-sm"
            value={form.siteDescription}
            onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
          />
        </div>
        <ImageUrlField
          label="تصویر Open Graph پیش‌فرض"
          hint="از کتابخانه رسانه انتخاب کنید."
          value={form.defaultOgImageUrl ?? ''}
          onChange={(url) => setForm({ ...form, defaultOgImageUrl: url || null })}
          folder="cms"
        />
        <div>
          <Label>شناسه Google Analytics</Label>
          <Input
            className="mt-1 font-mono text-sm"
            dir="ltr"
            value={form.googleAnalyticsId ?? ''}
            onChange={(e) =>
              setForm({ ...form, googleAnalyticsId: e.target.value || null })
            }
            placeholder="G-XXXXXXXX"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="robots-index"
            type="checkbox"
            checked={form.robotsIndex}
            onChange={(e) => setForm({ ...form, robotsIndex: e.target.checked })}
          />
          <Label htmlFor="robots-index">اجازه ایندکس (robots index)</Label>
        </div>
      </Card>
      <Button disabled={save.isPending} onClick={() => save.mutate(form)}>
        {save.isPending ? 'در حال ذخیره…' : 'ذخیره SEO'}
      </Button>
    </CmsPageShell>
  );
}
