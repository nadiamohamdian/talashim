'use client';

import { useRef, useState } from 'react';
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
import type { CmsLensVideoDto } from '@talashim/types';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import {
  createLensVideo,
  deleteLensVideo,
  fetchLensVideos,
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

const emptyForm = (): UpsertLensVideoPayload => ({
  title: '',
  videoUrl: '',
  thumbnailUrl: '',
  status: 'PUBLISHED',
  sortOrder: 0,
  productIds: [],
});

function validateForm(form: UpsertLensVideoPayload): string | null {
  const videoError = validateLibraryImageUrl(form.videoUrl ?? '', 'فایل ویدیو');
  if (videoError) {
    return videoError;
  }
  if (form.thumbnailUrl?.trim()) {
    const thumbError = validateLibraryImageUrl(form.thumbnailUrl, 'تصویر بندانگشتی');
    if (thumbError) {
      return thumbError;
    }
  }
  return null;
}

export function LensVideosPanel() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<UpsertLensVideoPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.lensVideos(page, status),
    queryFn: () =>
      fetchLensVideos({
        page,
        status: status || undefined,
      }),
  });

  const save = useMutation({
    mutationFn: async () => {
      const error = validateForm(form);
      if (error) {
        throw new Error(error);
      }

      const payload: UpsertLensVideoPayload = {
        title: form.title?.trim() || undefined,
        videoUrl: form.videoUrl?.trim() || undefined,
        thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
        heroImageUrl: form.heroImageUrl?.trim() || undefined,
        hotspots: form.hotspots,
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
      setForm(emptyForm());
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'lens-videos'] });
    },
    onError: (error: unknown) => {
      setSaveError(getApiErrorMessage(error, 'ذخیره ویدیو ناموفق بود'));
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
      hotspots: video.hotspots,
      status: video.status,
      sortOrder: video.sortOrder,
      productIds: video.productIds ?? [],
    });
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSaveError(null);
  };

  return (
    <CmsPageShell routeId="cms.lens">
      <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-foreground">
          {editingId ? 'ویرایش ویدیو' : 'افزودن ویدیو جدید'}
        </h2>

        {saveError ? <Alert variant="destructive">{saveError}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>عنوان (اختیاری)</Label>
            <Input
              className="mt-1"
              value={form.title ?? ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثلاً: معرفی کالکشن بهار"
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
            <Label>فایل ویدیو *</Label>
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
                <Button type="button" variant="outline" onClick={() => setForm({ ...form, videoUrl: '' })}>
                  حذف
                </Button>
              ) : null}
            </div>
            {form.videoUrl ? (
              <p className="mt-2 truncate font-mono text-[10px] text-muted" dir="ltr">
                {form.videoUrl}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted">فرمت‌های مجاز: MP4، WebM — حداکثر ۵۰ مگابایت</p>
            )}
          </div>
          <div className="md:col-span-2">
            <ImageUrlField
              label="تصویر بندانگشتی (اختیاری)"
              hint="در صورت خالی بودن، اولین فریم ویدیو نمایش داده می‌شود."
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
              label="محصولات این ویدیو"
              description="محصولات در پاپ‌آپ لنز نمایش داده می‌شوند و با کلیک کاربر به صفحه محصول هدایت می‌شود."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'در حال ذخیره…' : editingId ? 'به‌روزرسانی' : 'افزودن ویدیو'}
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

      {isLoading ? (
        <Skeleton className="mt-4 h-64 w-full" />
      ) : isError ? (
        <p className="mt-4 text-[var(--error)]">بارگذاری ویدیوها ناموفق بود.</p>
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
              {data?.items.map((video) => (
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
              {!data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted">
                    ویدیویی ثبت نشده است.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Card>
      )}

      {data ? (
        <PaginationBar
          page={page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      ) : null}
    </CmsPageShell>
  );
}
