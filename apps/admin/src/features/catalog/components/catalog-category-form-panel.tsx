'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { buildDefaultCatalogCategoryFilterConfig } from '@sadafgold/shared';
import type {
  CatalogCategoryFilterConfig,
  CatalogCategoryFilterOption,
  CatalogCategoryFilterSection,
} from '@sadafgold/types';
import { Button, Card, Input, Label, Skeleton } from '@sadafgold/ui';
import {
  createAdminCatalogCategory,
  fetchAdminCatalogCategory,
  updateAdminCatalogCategory,
} from '../api/catalog-categories-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { ImageUrlField } from '@/features/cms/components/image-url-field';
import { IMAGE_FRAME_PRESETS } from '@/features/cms/lib/image-frame-spec';
import { CatalogPageShell } from '@/features/commerce/components/catalog-page-shell';
import { selectFieldClass } from '@/features/commerce/lib/labels';

const PRODUCT_CATEGORY_OPTIONS = [
  { value: '', label: 'بدون اتصال مستقیم' },
  { value: 'RING', label: 'انگشتر' },
  { value: 'NECKLACE', label: 'گردنبند' },
  { value: 'BRACELET', label: 'دستبند' },
  { value: 'EARRING', label: 'گوشواره' },
  { value: 'COIN', label: 'سکه' },
  { value: 'WEDDING_RING', label: 'حلقه ازدواج' },
];

const MAX_HERO_IMAGES = 8;

interface CatalogCategoryFormPanelProps {
  categoryId?: string;
}

function createEmptyFilterConfig(slug: string): CatalogCategoryFilterConfig {
  return buildDefaultCatalogCategoryFilterConfig(slug || 'rings');
}

export function CatalogCategoryFormPanel({ categoryId }: CatalogCategoryFormPanelProps) {
  const router = useRouter();
  const isEdit = Boolean(categoryId);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'catalog-categories', categoryId],
    queryFn: () => fetchAdminCatalogCategory(categoryId!),
    enabled: isEdit,
  });

  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [heroImageUrls, setHeroImageUrls] = useState<string[]>(['']);
  const [filterConfig, setFilterConfig] = useState<CatalogCategoryFilterConfig>(
    createEmptyFilterConfig('rings'),
  );
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    setSlug(data.slug);
    setTitle(data.title);
    setSubtitle(data.subtitle ?? '');
    setProductCategory(data.productCategory ?? '');
    setHeroImageUrls(data.heroImageUrls.length > 0 ? data.heroImageUrls : ['']);
    setFilterConfig(data.filterConfig);
    setSortOrder(data.sortOrder);
    setIsActive(data.isActive);
    setSeoTitle(data.seoTitle ?? '');
    setSeoDescription(data.seoDescription ?? '');
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        slug,
        title,
        subtitle: subtitle || null,
        productCategory: productCategory || null,
        heroImageUrls: heroImageUrls.map((url) => url.trim()).filter(Boolean),
        filterConfig,
        sortOrder,
        isActive,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      };

      if (isEdit && categoryId) {
        return updateAdminCatalogCategory(categoryId, payload);
      }

      return createAdminCatalogCategory(payload);
    },
    onSuccess: () => {
      router.push('/catalog/categories');
      router.refresh();
    },
    onError: (mutationError) => {
      setError(getApiErrorMessage(mutationError));
    },
  });

  const updateFilterSection = (
    sectionIndex: number,
    updater: (section: CatalogCategoryFilterSection) => CatalogCategoryFilterSection,
  ) => {
    setFilterConfig((current) => ({
      ...current,
      filterSections: current.filterSections.map((section, index) =>
        index === sectionIndex ? updater(section) : section,
      ),
    }));
  };

  const updateFilterOption = (
    sectionIndex: number,
    optionIndex: number,
    updater: (option: CatalogCategoryFilterOption) => CatalogCategoryFilterOption,
  ) => {
    updateFilterSection(sectionIndex, (section) => ({
      ...section,
      options: section.options.map((option, index) =>
        index === optionIndex ? updater(option) : option,
      ),
    }));
  };

  if (isEdit && isLoading) {
    return (
      <CatalogPageShell routeId="catalog.categories.edit">
        <Skeleton className="h-64 w-full" />
      </CatalogPageShell>
    );
  }

  return (
    <CatalogPageShell routeId={isEdit ? 'catalog.categories.edit' : 'catalog.categories.new'}>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          saveMutation.mutate();
        }}
      >
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Card className="space-y-4 border-zinc-200 p-6">
          <h2 className="text-lg font-medium">اطلاعات صفحه</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="category-title">عنوان</Label>
              <Input
                id="category-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category-slug">شناسه (slug)</Label>
              <Input
                id="category-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                dir="ltr"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="category-subtitle">زیرعنوان</Label>
              <Input
                id="category-subtitle"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category-product-category">دسته محصولات</Label>
              <select
                id="category-product-category"
                className={selectFieldClass}
                value={productCategory}
                onChange={(event) => setProductCategory(event.target.value)}
              >
                {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value || 'none'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="category-sort-order">ترتیب نمایش</Label>
              <Input
                id="category-sort-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="category-active"
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              <Label htmlFor="category-active">فعال در فروشگاه</Label>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 border-zinc-200 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">بنرهای Hero (اسلایدر)</h2>
            <Button
              type="button"
              variant="outline"
              disabled={heroImageUrls.length >= MAX_HERO_IMAGES}
              onClick={() => setHeroImageUrls((current) => [...current, ''])}
            >
              افزودن تصویر
            </Button>
          </div>
          {heroImageUrls.map((url, index) => (
            <div key={`hero-${index}`} className="rounded-xl border border-zinc-200 p-4">
              <ImageUrlField
                label={`تصویر ${index + 1}`}
                value={url}
                onChange={(nextUrl) =>
                  setHeroImageUrls((current) =>
                    current.map((item, itemIndex) => (itemIndex === index ? nextUrl : item)),
                  )
                }
                folder="general"
                frame={IMAGE_FRAME_PRESETS.categoryHero}
              />
              {heroImageUrls.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 text-red-600"
                  onClick={() =>
                    setHeroImageUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  حذف اسلاید
                </Button>
              ) : null}
            </div>
          ))}
        </Card>

        <Card className="space-y-6 border-zinc-200 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">فیلترها و مرتب‌سازی</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFilterConfig(createEmptyFilterConfig(slug || 'rings'))}
            >
              بازنشانی پیش‌فرض
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">گزینه‌های مرتب‌سازی</h3>
            {filterConfig.sortOptions.map((option, index) => (
              <div key={option.id} className="grid gap-2 md:grid-cols-2">
                <Input
                  value={option.label}
                  onChange={(event) =>
                    setFilterConfig((current) => ({
                      ...current,
                      sortOptions: current.sortOptions.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, label: event.target.value } : item,
                      ),
                    }))
                  }
                />
                <Input value={option.id} dir="ltr" disabled />
              </div>
            ))}
          </div>

          {filterConfig.filterSections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-3 rounded-xl border border-zinc-200 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>عنوان بخش فیلتر</Label>
                  <Input
                    value={section.title}
                    onChange={(event) =>
                      updateFilterSection(sectionIndex, (current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>شناسه بخش</Label>
                  <Input value={section.id} dir="ltr" disabled />
                </div>
              </div>

              {section.options.map((option, optionIndex) => (
                <div key={option.id} className="grid gap-2 rounded-lg bg-zinc-50 p-3 md:grid-cols-2">
                  <div>
                    <Label>برچسب</Label>
                    <Input
                      value={option.label}
                      onChange={(event) =>
                        updateFilterOption(sectionIndex, optionIndex, (current) => ({
                          ...current,
                          label: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>شناسه</Label>
                    <Input value={option.id} dir="ltr" disabled />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFilterSection(sectionIndex, (current) => ({
                    ...current,
                    options: [
                      ...current.options,
                      {
                        id: `${current.id}-option-${current.options.length + 1}`,
                        label: 'گزینه جدید',
                      },
                    ],
                  }))
                }
              >
                افزودن گزینه
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFilterConfig((current) => ({
                ...current,
                filterSections: [
                  ...current.filterSections,
                  {
                    id: `custom-${current.filterSections.length + 1}`,
                    title: 'فیلتر سفارشی',
                    options: [{ id: `custom-${current.filterSections.length + 1}-1`, label: 'گزینه ۱' }],
                  },
                ],
              }))
            }
          >
            افزودن بخش فیلتر
          </Button>
        </Card>

        <Card className="space-y-4 border-zinc-200 p-6">
          <h2 className="text-lg font-medium">سئو</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="category-seo-title">عنوان سئو</Label>
              <Input
                id="category-seo-title"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="category-seo-description">توضیح سئو</Label>
              <Input
                id="category-seo-description"
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/catalog/categories')}>
            انصراف
          </Button>
        </div>
      </form>
    </CatalogPageShell>
  );
}
