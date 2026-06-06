'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@talashim/ui';
import type { CmsHeroConfig, CmsHomepageDto, CmsHomepageSections } from '@talashim/types';
import { fetchHomepageCms, updateHomepageCms } from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { CmsPageShell } from './cms-page-shell';
import { ImageUrlField } from './image-url-field';
import { RichTextEditor } from '@/shared/ui/rich-text-editor';

export function HomepagePanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.homepage,
    queryFn: fetchHomepageCms,
  });

  const [hero, setHero] = useState<CmsHeroConfig | null>(null);
  const [sections, setSections] = useState<CmsHomepageSections | null>(null);

  useEffect(() => {
    if (data) {
      setHero(data.hero);
      setSections(data.sections);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: Pick<CmsHomepageDto, 'hero' | 'sections'>) => updateHomepageCms(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.cms.homepage });
    },
  });

  if (isLoading || !hero || !sections) {
    return (
      <CmsPageShell routeId="cms.homepage">
        <Skeleton className="h-96 w-full" />
      </CmsPageShell>
    );
  }

  if (isError) {
    return (
      <CmsPageShell routeId="cms.homepage">
        <p className="text-[var(--error)]">بارگذاری تنظیمات صفحه اصلی ناموفق بود.</p>
      </CmsPageShell>
    );
  }

  return (
    <CmsPageShell routeId="cms.homepage">
      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">بخش هیرو</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>برچسب</Label>
            <Input
              className="mt-1"
              value={hero.badge}
              onChange={(e) => setHero({ ...hero, badge: e.target.value })}
            />
          </div>
          <div>
            <Label>عنوان اصلی</Label>
            <Input
              className="mt-1"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
            />
          </div>
          <div>
            <Label>خط تأکید طلایی</Label>
            <Input
              className="mt-1"
              value={hero.titleAccent}
              onChange={(e) => setHero({ ...hero, titleAccent: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <RichTextEditor
              label="توضیح"
              value={hero.description}
              onChange={(description) => setHero({ ...hero, description })}
              minHeight={120}
            />
          </div>
          <div>
            <Label>دکمه اصلی — متن</Label>
            <Input
              className="mt-1"
              value={hero.primaryCta.label}
              onChange={(e) =>
                setHero({
                  ...hero,
                  primaryCta: { ...hero.primaryCta, label: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>دکمه اصلی — لینک</Label>
            <Input
              className="mt-1 font-mono text-sm"
              dir="ltr"
              value={hero.primaryCta.href}
              onChange={(e) =>
                setHero({
                  ...hero,
                  primaryCta: { ...hero.primaryCta, href: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>دکمه ثانویه — متن</Label>
            <Input
              className="mt-1"
              value={hero.secondaryCta.label}
              onChange={(e) =>
                setHero({
                  ...hero,
                  secondaryCta: { ...hero.secondaryCta, label: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>دکمه ثانویه — لینک</Label>
            <Input
              className="mt-1 font-mono text-sm"
              dir="ltr"
              value={hero.secondaryCta.href}
              onChange={(e) =>
                setHero({
                  ...hero,
                  secondaryCta: { ...hero.secondaryCta, href: e.target.value },
                })
              }
            />
          </div>
          <div className="md:col-span-2">
            <ImageUrlField
              label="تصویر هیرو"
              value={hero.imageUrl}
              onChange={(url) => setHero({ ...hero, imageUrl: url })}
              folder="banners"
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">بخش‌های محصول</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>عنوان محصولات ویژه</Label>
            <Input
              className="mt-1"
              value={sections.featuredTitle}
              onChange={(e) => setSections({ ...sections, featuredTitle: e.target.value })}
            />
          </div>
          <div>
            <Label>زیرعنوان ویژه</Label>
            <Input
              className="mt-1"
              value={sections.featuredSubtitle}
              onChange={(e) => setSections({ ...sections, featuredSubtitle: e.target.value })}
            />
          </div>
          <div>
            <Label>عنوان پرفروش‌ها</Label>
            <Input
              className="mt-1"
              value={sections.bestsellerTitle}
              onChange={(e) => setSections({ ...sections, bestsellerTitle: e.target.value })}
            />
          </div>
          <div>
            <Label>زیرعنوان پرفروش‌ها</Label>
            <Input
              className="mt-1"
              value={sections.bestsellerSubtitle}
              onChange={(e) =>
                setSections({ ...sections, bestsellerSubtitle: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="show-categories"
              type="checkbox"
              checked={sections.showCategoryShowcase}
              onChange={(e) =>
                setSections({ ...sections, showCategoryShowcase: e.target.checked })
              }
            />
            <Label htmlFor="show-categories">نمایش ویترین دسته‌بندی</Label>
          </div>
        </div>
      </Card>

      <Button
        disabled={save.isPending}
        onClick={() => save.mutate({ hero, sections })}
      >
        {save.isPending ? 'در حال ذخیره…' : 'ذخیره صفحه اصلی'}
      </Button>
      {data?.updatedAt ? (
        <p className="text-xs text-muted">
          آخرین به‌روزرسانی: {formatPersianDateTime(data.updatedAt)}
        </p>
      ) : null}
    </CmsPageShell>
  );
}
