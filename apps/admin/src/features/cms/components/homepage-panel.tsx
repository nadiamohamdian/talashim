'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@talashim/ui';
import type {
  CmsCategoryShowcaseItem,
  CmsCategoryShowcaseSlug,
  CmsHeroConfig,
  CmsHeroDesktopCarouselItem,
  CmsHomepageDto,
  CmsHomepageSections,
} from '@talashim/types';
import { fetchHomepageCms, updateHomepageCms } from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { CmsPageShell } from './cms-page-shell';
import { BannerProductPicker } from './banner-product-picker';
import { ImageUrlField } from './image-url-field';
import { IMAGE_FRAME_PRESETS } from '../lib/image-frame-spec';
import { validateLibraryImageUrl } from '../lib/validate-library-image';
import { RichTextEditor } from '@/shared/ui/rich-text-editor';

const MAX_DESKTOP_CAROUSEL_ITEMS = 12;

const DEFAULT_DESKTOP_CAROUSEL_ITEMS: CmsHeroDesktopCarouselItem[] = [
  { id: 'hero-carousel-ring', imageUrl: '', href: '/products?category=rings' },
  { id: 'hero-carousel-necklace', imageUrl: '', href: '/products?category=necklaces' },
  { id: 'hero-carousel-bracelet', imageUrl: '', href: '/products?category=bracelets' },
  { id: 'hero-carousel-earrings', imageUrl: '', href: '/products?category=earrings' },
  { id: 'hero-carousel-sets', imageUrl: '', href: '/products?category=sets' },
];

const MIN_BESTSELLER_PRODUCTS = 7;
const MAX_BESTSELLER_PRODUCTS = 12;

const MIN_NEW_ARRIVALS_PRODUCTS = 1;
const MAX_NEW_ARRIVALS_PRODUCTS = 12;

function withBestsellerDefaults(sections: CmsHomepageSections): CmsHomepageSections {
  return {
    ...sections,
    bestsellerProductIds: sections.bestsellerProductIds ?? [],
    newArrivalsProductIds: sections.newArrivalsProductIds ?? [],
    newArrivalsTitle: sections.newArrivalsTitle?.trim() || 'جدیدترین ها',
  };
}

const DEFAULT_CATEGORY_SHOWCASE_ITEMS: CmsCategoryShowcaseItem[] = [
  { slug: 'rings', label: 'انگشتر', href: '/products?category=rings' },
  { slug: 'bracelets', label: 'دستبند', href: '/products?category=bracelets' },
  { slug: 'earrings', label: 'گوشواره', href: '/products?category=earrings' },
  { slug: 'necklaces', label: 'گردنبند', href: '/products?category=necklaces' },
];

const CATEGORY_SHOWCASE_LABELS: Record<CmsCategoryShowcaseSlug, string> = {
  rings: 'انگشتر',
  bracelets: 'دستبند',
  earrings: 'گوشواره',
  necklaces: 'گردنبند',
};

function withCategoryShowcaseDefaults(sections: CmsHomepageSections): CmsHomepageSections {
  const configuredItems = sections.categoryShowcase?.items ?? [];

  return {
    ...sections,
    categoryShowcase: {
      title: sections.categoryShowcase?.title?.trim() || 'دسته بندی محصولات',
      items: DEFAULT_CATEGORY_SHOWCASE_ITEMS.map((fallback) => {
        const configured = configuredItems.find((item) => item.slug === fallback.slug);
        return {
          ...fallback,
          label: configured?.label?.trim() || fallback.label,
          href: configured?.href?.trim() || fallback.href,
          mobileImageUrl: configured?.mobileImageUrl ?? '',
          desktopImageUrl: configured?.desktopImageUrl ?? '',
        };
      }),
    },
  };
}

function withDesktopHeroDefaults(hero: CmsHeroConfig): CmsHeroConfig {
  return {
    ...hero,
    desktopBackgroundImageUrl: hero.desktopBackgroundImageUrl ?? '',
    desktopCarouselItems:
      hero.desktopCarouselItems && hero.desktopCarouselItems.length > 0
        ? hero.desktopCarouselItems
        : DEFAULT_DESKTOP_CAROUSEL_ITEMS.map((item) => ({ ...item })),
  };
}

function createDesktopCarouselItem(index: number): CmsHeroDesktopCarouselItem {
  return {
    id: `hero-desktop-carousel-${Date.now()}-${index}`,
    imageUrl: '',
    href: '/products',
  };
}

export function HomepagePanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.homepage,
    queryFn: fetchHomepageCms,
  });

  const [hero, setHero] = useState<CmsHeroConfig | null>(null);
  const [sections, setSections] = useState<CmsHomepageSections | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setHero(withDesktopHeroDefaults(data.hero));
      setSections(withCategoryShowcaseDefaults(withBestsellerDefaults(data.sections)));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: Pick<CmsHomepageDto, 'hero' | 'sections'>) => updateHomepageCms(payload),
    onSuccess: () => {
      setSaveError(null);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.cms.homepage });
    },
    onError: (error: unknown) => {
      setSaveError(getApiErrorMessage(error, 'ذخیره صفحه اصلی ناموفق بود'));
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
        <h2 className="text-sm font-semibold text-foreground">بخش هیرو (موبایل و دسکتاپ)</h2>
        <p className="text-xs text-muted">
          عنوان، توضیح، متن دکمه و تصویر پس‌زمینه هیرو موبایل از اینجا قابل ویرایش است. پس از ذخیره،
          تغییرات در صفحه اصلی فروشگاه اعمال می‌شود.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>برچسب (دسکتاپ)</Label>
            <Input
              className="mt-1"
              value={hero.badge}
              onChange={(e) => setHero({ ...hero, badge: e.target.value })}
            />
          </div>
          <div>
            <Label>عنوان هیرو</Label>
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
              mediaFolder="banners"
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
              label="تصویر پس‌زمینه هیرو موبایل"
              hint="پیشنهاد: تصویر عمودی با کیفیت بالا (حداقل ۱۲۰۰×۲۱۰۰ پیکسل). در موبایل تمام‌صفحه نمایش داده می‌شود."
              value={hero.imageUrl}
              onChange={(url) => setHero({ ...hero, imageUrl: url })}
              folder="general"
              previewAlt="پیش‌نمایش هیرو موبایل"
              frame={IMAGE_FRAME_PRESETS.heroMobile}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">هیرو دسکتاپ</h2>
        <p className="text-xs text-muted">
          تصویر پس‌زمینه و آیتم‌های کاروسل محصولات در پنل هیرو دسکتاپ از اینجا قابل ویرایش است. اگر
          تصویری انتخاب نشود، تصاویر پیش‌فرض فروشگاه نمایش داده می‌شوند.
        </p>

        <ImageUrlField
          label="تصویر پس‌زمینه هیرو دسکتاپ"
          hint="پیشنهاد: تصویر افقی با کیفیت بالا (حداقل ۱۹۲۰×۱۰۸۰ پیکسل)."
          value={hero.desktopBackgroundImageUrl ?? ''}
          onChange={(url) => setHero({ ...hero, desktopBackgroundImageUrl: url })}
          folder="banners"
          previewAlt="پیش‌نمایش هیرو دسکتاپ"
          frame={IMAGE_FRAME_PRESETS.heroDesktop}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-foreground">کاروسل محصولات</h3>
            <Button
              type="button"
              variant="outline"
              disabled={(hero.desktopCarouselItems?.length ?? 0) >= MAX_DESKTOP_CAROUSEL_ITEMS}
              onClick={() =>
                setHero({
                  ...hero,
                  desktopCarouselItems: [
                    ...(hero.desktopCarouselItems ?? []),
                    createDesktopCarouselItem(hero.desktopCarouselItems?.length ?? 0),
                  ],
                })
              }
            >
              افزودن آیتم
            </Button>
          </div>

          {(hero.desktopCarouselItems ?? []).map((item, index) => (
            <div
              key={item.id}
              className="space-y-3 rounded-lg border border-[var(--border-subtle)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">آیتم {index + 1}</p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={(hero.desktopCarouselItems?.length ?? 0) <= 1}
                  onClick={() =>
                    setHero({
                      ...hero,
                      desktopCarouselItems: (hero.desktopCarouselItems ?? []).filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                >
                  حذف
                </Button>
              </div>

              <ImageUrlField
                label="تصویر محصول"
                hint="تصویر شفاف یا برش‌خورده با پس‌زمینه خاکستری در هیرو نمایش داده می‌شود."
                value={item.imageUrl}
                onChange={(url) =>
                  setHero({
                    ...hero,
                    desktopCarouselItems: (hero.desktopCarouselItems ?? []).map((entry, itemIndex) =>
                      itemIndex === index ? { ...entry, imageUrl: url } : entry,
                    ),
                  })
                }
                folder="banners"
                previewAlt={`پیش‌نمایش آیتم ${index + 1}`}
                previewClassName="aspect-square max-h-40 w-full rounded-lg object-contain bg-[#d9d9d9]"
              />

              <div>
                <Label>لینک</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  dir="ltr"
                  value={item.href}
                  onChange={(e) =>
                    setHero({
                      ...hero,
                      desktopCarouselItems: (hero.desktopCarouselItems ?? []).map((entry, itemIndex) =>
                        itemIndex === index ? { ...entry, href: e.target.value } : entry,
                      ),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">ویترین دسته‌بندی</h2>
        <p className="text-xs text-muted">
          عنوان بخش و تصاویر دسکتاپ هر دسته از اینجا قابل ویرایش است. اگر تصویری انتخاب نشود،
          تصویر پیش‌فرض فروشگاه نمایش داده می‌شود.
        </p>

        <div>
          <Label>عنوان بخش</Label>
          <Input
            className="mt-1"
            value={sections.categoryShowcase?.title ?? ''}
            onChange={(e) =>
              setSections({
                ...sections,
                categoryShowcase: {
                  ...(sections.categoryShowcase ?? { title: '', items: [] }),
                  title: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="space-y-6">
          {(sections.categoryShowcase?.items ?? DEFAULT_CATEGORY_SHOWCASE_ITEMS).map((item) => (
            <div
              key={item.slug}
              className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-4"
            >
              <h3 className="text-sm font-medium text-foreground">
                {CATEGORY_SHOWCASE_LABELS[item.slug]}
              </h3>
              <ImageUrlField
                label="تصویر دسکتاپ"
                hint="پیشنهاد: تصویر عمودی ۲۹۳×۴۴۰ پیکسل (نسبت ۲:۳)."
                value={item.desktopImageUrl ?? ''}
                onChange={(url) =>
                  setSections({
                    ...sections,
                    categoryShowcase: {
                      ...(sections.categoryShowcase ?? { title: '', items: [] }),
                      items: (sections.categoryShowcase?.items ?? []).map((entry) =>
                        entry.slug === item.slug ? { ...entry, desktopImageUrl: url } : entry,
                      ),
                    },
                  })
                }
                folder="general"
                previewAlt={`پیش‌نمایش ${item.label}`}
                previewClassName="aspect-[293/440] max-h-56 w-full rounded-lg object-cover"
              />
              <ImageUrlField
                label="تصویر موبایل (اختیاری)"
                hint="در صورت خالی بودن، تصویر پیش‌فرض موبایل استفاده می‌شود."
                value={item.mobileImageUrl ?? ''}
                onChange={(url) =>
                  setSections({
                    ...sections,
                    categoryShowcase: {
                      ...(sections.categoryShowcase ?? { title: '', items: [] }),
                      items: (sections.categoryShowcase?.items ?? []).map((entry) =>
                        entry.slug === item.slug ? { ...entry, mobileImageUrl: url } : entry,
                      ),
                    },
                  })
                }
                folder="general"
                previewAlt={`پیش‌نمایش موبایل ${item.label}`}
                previewClassName="aspect-[2/3] max-h-40 w-full rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">پرفروش‌ترین‌ها</h2>
        <p className="text-xs text-muted">
          بین {MIN_BESTSELLER_PRODUCTS.toLocaleString('fa-IR')} تا{' '}
          {MAX_BESTSELLER_PRODUCTS.toLocaleString('fa-IR')} محصول از فهرست محصولات انتخاب کنید تا در
          کاروسل صفحه اصلی نمایش داده شوند. اگر لیست خالی باشد، پرفروش‌ترین‌های خودکار نمایش
          داده می‌شوند.
        </p>

        <div>
          <Label>عنوان بخش</Label>
          <Input
            className="mt-1"
            value={sections.bestsellerTitle}
            onChange={(e) => setSections({ ...sections, bestsellerTitle: e.target.value })}
          />
        </div>

        <BannerProductPicker
          value={sections.bestsellerProductIds ?? []}
          onChange={(productIds) =>
            setSections({ ...sections, bestsellerProductIds: productIds })
          }
          minProducts={MIN_BESTSELLER_PRODUCTS}
          maxProducts={MAX_BESTSELLER_PRODUCTS}
          label="محصولات پرفروش"
          description="ترتیب انتخاب، ترتیب نمایش در کاروسل را تعیین می‌کند."
        />
      </Card>

      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">جدیدترین‌ها</h2>
        <p className="text-xs text-muted">
          بین {MIN_NEW_ARRIVALS_PRODUCTS.toLocaleString('fa-IR')} تا{' '}
          {MAX_NEW_ARRIVALS_PRODUCTS.toLocaleString('fa-IR')} محصول از فهرست محصولات انتخاب کنید تا در
          کاروسل «جدیدترین‌ها» نمایش داده شوند. اگر لیست خالی باشد، جدیدترین محصولات خودکار نمایش
          داده می‌شوند.
        </p>

        <div>
          <Label>عنوان بخش</Label>
          <Input
            className="mt-1"
            value={sections.newArrivalsTitle}
            onChange={(e) => setSections({ ...sections, newArrivalsTitle: e.target.value })}
          />
        </div>

        <BannerProductPicker
          value={sections.newArrivalsProductIds ?? []}
          onChange={(productIds) =>
            setSections({ ...sections, newArrivalsProductIds: productIds })
          }
          minProducts={MIN_NEW_ARRIVALS_PRODUCTS}
          maxProducts={MAX_NEW_ARRIVALS_PRODUCTS}
          label="محصولات جدید"
          description="ترتیب انتخاب، ترتیب نمایش در کاروسل را تعیین می‌کند."
        />
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

      {saveError ? (
        <p className="text-sm text-[var(--error)]">{saveError}</p>
      ) : null}

      <Button
        disabled={save.isPending}
        onClick={() => {
          const imageError = hero.imageUrl
            ? validateLibraryImageUrl(hero.imageUrl, 'تصویر هیرو')
            : null;
          if (imageError) {
            setSaveError(imageError);
            return;
          }

          if (hero.desktopBackgroundImageUrl?.trim()) {
            const desktopBgError = validateLibraryImageUrl(
              hero.desktopBackgroundImageUrl,
              'تصویر پس‌زمینه هیرو دسکتاپ',
            );
            if (desktopBgError) {
              setSaveError(desktopBgError);
              return;
            }
          }

          for (const [index, item] of (hero.desktopCarouselItems ?? []).entries()) {
            if (!item.imageUrl.trim()) {
              continue;
            }
            const carouselImageError = validateLibraryImageUrl(
              item.imageUrl,
              `تصویر کاروسل ${index + 1}`,
            );
            if (carouselImageError) {
              setSaveError(carouselImageError);
              return;
            }
          }

          for (const item of sections.categoryShowcase?.items ?? []) {
            if (item.desktopImageUrl?.trim()) {
              const desktopImageError = validateLibraryImageUrl(
                item.desktopImageUrl,
                `تصویر دسکتاپ ${item.label}`,
              );
              if (desktopImageError) {
                setSaveError(desktopImageError);
                return;
              }
            }

            if (item.mobileImageUrl?.trim()) {
              const mobileImageError = validateLibraryImageUrl(
                item.mobileImageUrl,
                `تصویر موبایل ${item.label}`,
              );
              if (mobileImageError) {
                setSaveError(mobileImageError);
                return;
              }
            }
          }

          const bestsellerIds = sections.bestsellerProductIds ?? [];
          if (
            bestsellerIds.length > 0 &&
            (bestsellerIds.length < MIN_BESTSELLER_PRODUCTS ||
              bestsellerIds.length > MAX_BESTSELLER_PRODUCTS)
          ) {
            setSaveError(
              `بخش پرفروش‌ترین‌ها باید بین ${MIN_BESTSELLER_PRODUCTS.toLocaleString('fa-IR')} تا ${MAX_BESTSELLER_PRODUCTS.toLocaleString('fa-IR')} محصول باشد.`,
            );
            return;
          }

          const newArrivalsIds = sections.newArrivalsProductIds ?? [];
          if (
            newArrivalsIds.length > 0 &&
            (newArrivalsIds.length < MIN_NEW_ARRIVALS_PRODUCTS ||
              newArrivalsIds.length > MAX_NEW_ARRIVALS_PRODUCTS)
          ) {
            setSaveError(
              `بخش جدیدترین‌ها باید بین ${MIN_NEW_ARRIVALS_PRODUCTS.toLocaleString('fa-IR')} تا ${MAX_NEW_ARRIVALS_PRODUCTS.toLocaleString('fa-IR')} محصول باشد.`,
            );
            return;
          }

          setSaveError(null);
          save.mutate({
            hero: {
              ...hero,
              desktopCarouselItems: (hero.desktopCarouselItems ?? []).filter((item) =>
                item.imageUrl.trim(),
              ),
            },
            sections: {
              ...sections,
              categoryShowcase: sections.categoryShowcase
                ? {
                    ...sections.categoryShowcase,
                    items: sections.categoryShowcase.items.map((item) => ({
                      ...item,
                      mobileImageUrl: item.mobileImageUrl?.trim() ?? '',
                      desktopImageUrl: item.desktopImageUrl?.trim() ?? '',
                    })),
                  }
                : undefined,
              bestsellerProductIds: sections.bestsellerProductIds ?? [],
              newArrivalsProductIds: sections.newArrivalsProductIds ?? [],
              newArrivalsTitle: sections.newArrivalsTitle?.trim() || 'جدیدترین ها',
            },
          });
        }}
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
