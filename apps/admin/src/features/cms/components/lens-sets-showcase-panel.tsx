'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@talashim/ui';
import type { CmsHomepageDto, CmsLensHotspot, CmsLensVideoDto } from '@talashim/types';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import {
  createLensVideo,
  deleteLensVideo,
  fetchHomepageCms,
  fetchLensVideos,
  updateHomepageCms,
  updateLensVideo,
  uploadMediaVideo,
  type UpsertLensVideoPayload,
} from '../api/cms-api';
import { ImageUrlField } from './image-url-field';
import { BannerProductPicker } from './banner-product-picker';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { BANNER_STATUS_FA, selectFieldClass } from '../lib/labels';
import { validateLibraryImageUrl } from '../lib/validate-library-image';

const VIDEO_ACCEPT = 'video/mp4,video/webm';
const HOTSPOT_COUNT = 3;

const DEFAULT_SECTION_COPY = {
  eyebrow: 'Talashim Lens',
  title: 'ست‌ها از نمای نزدیک',
  description:
    'از نیم‌ست‌های ظریف روزمره تا ست‌های کامل و چشمگیر، مجموعه‌ای متنوع برای سلیقه‌ها و مناسبت‌های مختلف.',
};

const DEFAULT_HOTSPOTS: CmsLensHotspot[] = [
  {
    id: 'hotspot-ring',
    top: '52%',
    left: '36%',
    chipTop: '75px',
    chipLeft: '-11px',
    chipTranslateX: '-12%',
    chipTranslateY: 'calc(-100% - 8px)',
  },
  {
    id: 'hotspot-earring',
    top: '20%',
    left: '58%',
    chipTop: '92px',
    chipLeft: '435px',
    chipTranslateX: '-88%',
    chipTranslateY: 'calc(-100% - 8px)',
  },
  {
    id: 'hotspot-bracelet',
    top: '72%',
    left: '40%',
    chipTop: '201px',
    chipLeft: '46px',
    chipTranslateX: '-20%',
    chipTranslateY: 'calc(-100% - 8px)',
  },
];

const emptySlideForm = (): UpsertLensVideoPayload => ({
  title: '',
  videoUrl: '',
  thumbnailUrl: '',
  heroImageUrl: '',
  hotspots: DEFAULT_HOTSPOTS.map((spot) => ({ ...spot })),
  status: 'PUBLISHED',
  sortOrder: 0,
  productIds: [],
});

function validateSlideForm(form: UpsertLensVideoPayload): string | null {
  const heroError = form.heroImageUrl?.trim()
    ? validateLibraryImageUrl(form.heroImageUrl, 'تصویر هیرو')
    : null;
  if (heroError) {
    return heroError;
  }

  const videoError = form.videoUrl?.trim()
    ? validateLibraryImageUrl(form.videoUrl, 'فایل ویدیو')
    : null;
  if (videoError) {
    return videoError;
  }

  if (!form.heroImageUrl?.trim() && !form.videoUrl?.trim()) {
    return 'حداقل یکی از تصویر هیرو یا فایل ویدیو الزامی است';
  }

  if (form.thumbnailUrl?.trim()) {
    const thumbError = validateLibraryImageUrl(form.thumbnailUrl, 'تصویر پوستر پاپ‌آپ');
    if (thumbError) {
      return thumbError;
    }
  }

  return null;
}

function normalizeHotspots(hotspots: CmsLensHotspot[] | undefined): CmsLensHotspot[] {
  const source = hotspots?.length ? hotspots : DEFAULT_HOTSPOTS;
  return Array.from({ length: HOTSPOT_COUNT }, (_, index) => ({
    ...DEFAULT_HOTSPOTS[index],
    ...source[index],
  }));
}

export function LensSetsShowcasePanel() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<UpsertLensVideoPayload>(emptySlideForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sectionCopy, setSectionCopy] = useState(DEFAULT_SECTION_COPY);

  const homepageQuery = useQuery({
    queryKey: adminQueryKeys.cms.homepage,
    queryFn: fetchHomepageCms,
  });

  const slidesQuery = useQuery({
    queryKey: adminQueryKeys.cms.lensVideos(page, status),
    queryFn: () =>
      fetchLensVideos({
        page,
        status: status || undefined,
      }),
  });

  const saveSection = useMutation({
    mutationFn: async () => {
      const homepage = homepageQuery.data;
      if (!homepage) {
        throw new Error('تنظیمات صفحه اصلی بارگذاری نشده است');
      }

      const payload: Pick<CmsHomepageDto, 'hero' | 'sections'> = {
        hero: homepage.hero,
        sections: {
          ...homepage.sections,
          lensSetsShowcase: {
            eyebrow: sectionCopy.eyebrow.trim() || DEFAULT_SECTION_COPY.eyebrow,
            title: sectionCopy.title.trim() || DEFAULT_SECTION_COPY.title,
            description: sectionCopy.description.trim() || DEFAULT_SECTION_COPY.description,
          },
        },
      };

      return updateHomepageCms(payload);
    },
    onSuccess: () => {
      setSectionError(null);
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.cms.homepage });
    },
    onError: (error: unknown) => {
      setSectionError(getApiErrorMessage(error, 'ذخیره متن بخش ناموفق بود'));
    },
  });

  const saveSlide = useMutation({
    mutationFn: async () => {
      const error = validateSlideForm(form);
      if (error) {
        throw new Error(error);
      }

      const payload: UpsertLensVideoPayload = {
        title: form.title?.trim() || undefined,
        videoUrl: form.videoUrl?.trim() || undefined,
        thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
        heroImageUrl: form.heroImageUrl?.trim() || undefined,
        hotspots: normalizeHotspots(form.hotspots),
        status: form.status,
        sortOrder: form.sortOrder ?? 0,
        productIds: form.productIds ?? [],
      };

      if (editingId) {
        return updateLensVideo(editingId, payload);
      }
      return createLensVideo(payload);
    },
    onSuccess: () => {
      setSaveError(null);
      setForm(emptySlideForm());
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'lens-videos'] });
    },
    onError: (error: unknown) => {
      setSaveError(getApiErrorMessage(error, 'ذخیره اسلاید ناموفق بود'));
    },
  });

  const remove = useMutation({
    mutationFn: deleteLensVideo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'lens-videos'] });
    },
  });

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setSaveError(null);
    try {
      const asset = await uploadMediaVideo(file, { folder: 'lens' });
      setForm((prev) => ({ ...prev, videoUrl: asset.url }));
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'آپلود ویدیو ناموفق بود'));
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (video: CmsLensVideoDto) => {
    setEditingId(video.id);
    setForm({
      title: video.title ?? '',
      videoUrl: video.videoUrl ?? '',
      thumbnailUrl: video.thumbnailUrl ?? '',
      heroImageUrl: video.heroImageUrl ?? '',
      hotspots: normalizeHotspots(video.hotspots),
      status: video.status,
      sortOrder: video.sortOrder,
      productIds: video.productIds ?? [],
    });
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptySlideForm());
    setSaveError(null);
  };

  const updateHotspot = (index: number, patch: Partial<CmsLensHotspot>) => {
    setForm((prev) => {
      const hotspots = normalizeHotspots(prev.hotspots);
      hotspots[index] = { ...hotspots[index], ...patch };
      return { ...prev, hotspots };
    });
  };

  useEffect(() => {
    const configured = homepageQuery.data?.sections.lensSetsShowcase;
    if (!configured) {
      return;
    }

    setSectionCopy({
      eyebrow: configured.eyebrow || DEFAULT_SECTION_COPY.eyebrow,
      title: configured.title || DEFAULT_SECTION_COPY.title,
      description: configured.description || DEFAULT_SECTION_COPY.description,
    });
  }, [homepageQuery.data?.sections.lensSetsShowcase]);

  return (
    <CmsPageShell routeId="cms.lensSets">
      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">متن بخش «ست‌ها از نمای نزدیک»</h2>
        <p className="text-xs text-muted">
          عنوان و توضیحات کنار تصویر در صفحه اصلی. اسلایدها و محصولات روی تصویر در فرم پایین تنظیم
          می‌شوند.
        </p>

        {sectionError ? <Alert variant="destructive">{sectionError}</Alert> : null}

        {homepageQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>برچسب بالای عنوان</Label>
              <Input
                className="mt-1"
                value={sectionCopy.eyebrow}
                onChange={(e) => setSectionCopy({ ...sectionCopy, eyebrow: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>عنوان بخش</Label>
              <Input
                className="mt-1"
                value={sectionCopy.title}
                onChange={(e) => setSectionCopy({ ...sectionCopy, title: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>توضیحات</Label>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-[var(--border-subtle)] bg-background px-3 py-2 text-sm text-foreground"
                value={sectionCopy.description}
                onChange={(e) => setSectionCopy({ ...sectionCopy, description: e.target.value })}
              />
            </div>
          </div>
        )}

        <Button
          type="button"
          onClick={() => saveSection.mutate()}
          disabled={saveSection.isPending || homepageQuery.isLoading}
        >
          {saveSection.isPending ? 'در حال ذخیره…' : 'ذخیره متن بخش'}
        </Button>
      </Card>

      <Card className="mt-6 space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">
          {editingId ? 'ویرایش اسلاید' : 'افزودن اسلاید جدید'}
        </h2>
        <p className="text-xs text-muted">
          تصویر هیرو روی صفحه اصلی نمایش داده می‌شود. با کلیک روی تصویر، پاپ‌آپ لنز (ویدیو یا پوستر)
          باز می‌شود و محصولات انتخاب‌شده نمایش داده می‌شوند. حداکثر ۳ محصول برای نقاط + روی تصویر
          استفاده می‌شود.
        </p>

        {saveError ? <Alert variant="destructive">{saveError}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>عنوان اسلاید (اختیاری)</Label>
            <Input
              className="mt-1"
              value={form.title ?? ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثلاً: کالکشن بهار"
            />
          </div>
          <div>
            <Label>ترتیب نمایش</Label>
            <Input
              className="mt-1"
              type="number"
              value={String(form.sortOrder ?? 0)}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>وضعیت</Label>
            <select
              className={selectFieldClass}
              value={form.status ?? 'PUBLISHED'}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as UpsertLensVideoPayload['status'] })
              }
            >
              {Object.entries(BANNER_STATUS_FA).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <ImageUrlField
              label="تصویر هیرو (روی صفحه اصلی) *"
              hint="تصویر بزرگ بخش ست‌ها — روی آن نقاط محصول نمایش داده می‌شود."
              value={form.heroImageUrl ?? ''}
              onChange={(url) => setForm({ ...form, heroImageUrl: url })}
              folder="lens"
            />
          </div>
          <div className="md:col-span-2">
            <Label>فایل ویدیو پاپ‌آپ (اختیاری)</Label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={VIDEO_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleVideoUpload(file);
                  }
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? 'در حال آپلود…' : form.videoUrl ? 'تغییر ویدیو' : 'آپلود ویدیو'}
              </Button>
              {form.videoUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, videoUrl: '' })}
                >
                  حذف
                </Button>
              ) : null}
            </div>
            {form.videoUrl ? (
              <p className="mt-2 truncate font-mono text-[10px] text-muted" dir="ltr">
                {form.videoUrl}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted">
                در صورت خالی بودن، با کلیک روی تصویر فقط پوستر/تصویر نمایش داده می‌شود.
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <ImageUrlField
              label="تصویر پوستر پاپ‌آپ (اختیاری)"
              hint="در پاپ‌آپ قبل از پخش ویدیو یا وقتی ویدیو ندارید نمایش داده می‌شود."
              value={form.thumbnailUrl ?? ''}
              onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
              folder="lens"
            />
          </div>
          <div className="md:col-span-2">
            <BannerProductPicker
              value={form.productIds ?? []}
              onChange={(productIds) => setForm({ ...form, productIds })}
              maxProducts={12}
              label="محصولات این اسلاید"
              description="۳ محصول اول برای نقاط + روی تصویر استفاده می‌شود. همه محصولات در پاپ‌آپ لنز نمایش داده می‌شوند."
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-[var(--border-subtle)] pt-4">
          <h3 className="text-sm font-medium text-foreground">موقعیت نقاط روی تصویر</h3>
          <p className="text-xs text-muted">
            مقادیر به صورت درصد (مثل ۵۲%) یا پیکسل (مثل ۴۶px) وارد کنید. هر نقطه به یکی از ۳ محصول
            اول متصل است.
          </p>
          {normalizeHotspots(form.hotspots).map((spot, index) => (
            <div
              key={spot.id ?? `hotspot-${index}`}
              className="grid gap-3 rounded-lg border border-[var(--border-subtle)] p-4 md:grid-cols-4"
            >
              <p className="md:col-span-4 text-xs font-medium text-foreground">نقطه {index + 1}</p>
              <div>
                <Label>موقعیت عمودی (+)</Label>
                <Input
                  className="mt-1"
                  value={spot.top}
                  onChange={(e) => updateHotspot(index, { top: e.target.value })}
                  placeholder="52%"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>موقعیت افقی (+)</Label>
                <Input
                  className="mt-1"
                  value={spot.left}
                  onChange={(e) => updateHotspot(index, { left: e.target.value })}
                  placeholder="36%"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>عمودی کارت محصول</Label>
                <Input
                  className="mt-1"
                  value={spot.chipTop ?? ''}
                  onChange={(e) => updateHotspot(index, { chipTop: e.target.value })}
                  placeholder="75px"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>افقی کارت محصول</Label>
                <Input
                  className="mt-1"
                  value={spot.chipLeft ?? ''}
                  onChange={(e) => updateHotspot(index, { chipLeft: e.target.value })}
                  placeholder="-11px"
                  dir="ltr"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => saveSlide.mutate()} disabled={saveSlide.isPending}>
            {saveSlide.isPending ? 'در حال ذخیره…' : editingId ? 'به‌روزرسانی اسلاید' : 'افزودن اسلاید'}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              انصراف
            </Button>
          ) : null}
        </div>
      </Card>

      <FilterBar className="mt-6">
        <select
          className={selectFieldClass}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(BANNER_STATUS_FA).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FilterBar>

      {slidesQuery.isLoading ? (
        <Skeleton className="mt-4 h-64 w-full" />
      ) : slidesQuery.isError ? (
        <p className="mt-4 text-[var(--error)]">بارگذاری اسلایدها ناموفق بود.</p>
      ) : (
        <Card className="mt-4 overflow-hidden border-[var(--border-subtle)] bg-[var(--card)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>ترتیب</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slidesQuery.data?.items.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>{video.title ?? '—'}</TableCell>
                  <TableCell>{video.sortOrder}</TableCell>
                  <TableCell>{BANNER_STATUS_FA[video.status]}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startEdit(video)}>
                        ویرایش
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[var(--error)]"
                        onClick={() => remove.mutate(video.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!slidesQuery.data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted">
                    اسلایدی ثبت نشده است.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Card>
      )}

      {slidesQuery.data ? (
        <PaginationBar
          page={page}
          total={slidesQuery.data.total}
          limit={slidesQuery.data.limit}
          onPageChange={setPage}
        />
      ) : null}
    </CmsPageShell>
  );
}
