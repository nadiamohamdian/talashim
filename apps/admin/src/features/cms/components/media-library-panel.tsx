'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@sadafgold/ui';
import type { MediaAssetDto } from '@talashim/types';
import {
  deleteMediaAsset,
  fetchMediaAssets,
  updateMediaAsset,
  uploadMediaImage,
} from '../api/cms-api';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { AdminApiError } from '@/shared/ui/admin-api-error';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { formatBytes, selectFieldClass } from '../lib/labels';
import { IMAGE_ACCEPT, MEDIA_FOLDERS, MEDIA_FOLDER_LABELS } from '../lib/media-folders';
import { setMediaPickerResult } from '../lib/media-picker-session';

export function MediaLibraryPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPickerMode = searchParams.get('picker') === '1';
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState(searchParams.get('folder') ?? '');
  const [selected, setSelected] = useState<MediaAssetDto | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fromQuery = searchParams.get('folder');
    if (fromQuery) {
      setFolder(fromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    setAltDraft(selected?.alt ?? '');
  }, [selected]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminQueryKeys.cms.media(page, search, folder),
    queryFn: () =>
      fetchMediaAssets({
        page,
        limit: 24,
        search: search || undefined,
        folder: folder || undefined,
      }),
    enabled: Boolean(accessToken),
  });

  const upload = useMutation({
    mutationFn: (file: File) => uploadMediaImage(file, { folder: folder || 'general' }),
    onSuccess: (asset) => {
      setSelected(asset);
      setStatusMessage('فایل با موفقیت آپلود شد.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'media'] });
    },
  });

  const updateAlt = useMutation({
    mutationFn: ({ id, alt }: { id: string; alt: string }) => updateMediaAsset(id, { alt }),
    onSuccess: (asset) => {
      setSelected(asset);
      setStatusMessage('متن جایگزین ذخیره شد.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: () => {
      setSelected(null);
      setStatusMessage('فایل از کتابخانه حذف شد.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'media'] });
    },
  });

  const copyUrl = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectForPicker = (url: string) => {
    setMediaPickerResult(url);
    router.back();
  };

  return (
    <CmsPageShell routeId="media.library">
      {isPickerMode ? (
        <Card className="border-[var(--warning-border)] bg-[var(--warning-bg)] p-4">
          <p className="text-sm font-semibold text-[var(--secondary)]">حالت انتخاب تصویر</p>
          <p className="mt-1 text-sm text-[var(--warning)]">
            روی تصویر کلیک کنید و «انتخاب این تصویر» را بزنید تا به فرم برگردید.
          </p>
        </Card>
      ) : null}

      {statusMessage ? (
        <Card className="border-[var(--success-border)] bg-[var(--success-bg)] p-4 text-sm text-[var(--success)]">
          {statusMessage}
        </Card>
      ) : null}

      <Card className="border-[var(--border-subtle)] bg-gradient-to-l from-[var(--warning-bg)] to-white p-6">
        <h3 className="text-sm font-bold text-foreground">کتابخانه رسانه</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          همانند وردپرس — تمام تصاویر محصولات، بنرها، وبلاگ و محتوا از اینجا آپلود و مدیریت
          می‌شوند. در فرم‌ها فقط از همین کتابخانه انتخاب کنید.
        </p>
        <div
          className="mt-4 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--primary)] bg-white/80 p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
            files.forEach((file) => upload.mutate(file));
          }}
        >
          <p className="text-sm font-medium text-foreground">فایل‌ها را اینجا رها کنید</p>
          <p className="mt-1 text-xs text-muted">JPEG، PNG، WebP، GIF</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <select
              className={selectFieldClass}
              value={folder || 'general'}
              onChange={(e) => setFolder(e.target.value)}
            >
              {MEDIA_FOLDERS.filter((item) => item.value).map((item) => (
                <option key={item.value} value={item.value}>
                  آپلود در: {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-gold"
              disabled={upload.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {upload.isPending ? 'در حال آپلود…' : 'انتخاب و آپلود'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              files.forEach((file) => upload.mutate(file));
              e.target.value = '';
            }}
          />
          {upload.isError ? (
            <p className="mt-3 text-xs text-[var(--error)]">{getApiErrorMessage(upload.error)}</p>
          ) : null}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {MEDIA_FOLDERS.map((item) => (
          <button
            key={item.value || 'all'}
            type="button"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              folder === item.value
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-white'
            }`}
            onClick={() => {
              setFolder(item.value);
              setPage(1);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="نام فایل یا متن جایگزین"
          />
        </div>
      </FilterBar>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />
          ) : isError ? (
            <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
              <AdminApiError
                title="بارگذاری کتابخانه رسانه ناموفق بود."
                error={error}
                onRetry={() => void refetch()}
              />
            </Card>
          ) : data?.items.length === 0 ? (
            <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
              هنوز فایلی آپلود نشده. اولین تصویر را بکشید و رها کنید یا دکمه آپلود را بزنید.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data?.items.map((asset) => (
                <Card
                  key={asset.id}
                  className={`cursor-pointer overflow-hidden border bg-[var(--card)] p-0 shadow-sm transition hover:ring-2 hover:ring-[var(--primary-muted)] ${
                    selected?.id === asset.id
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary-muted)]'
                      : 'border-[var(--border-subtle)]'
                  }`}
                  onClick={() => setSelected(asset)}
                >
                  <div className="relative aspect-square bg-nude-100">
                    {asset.mimeType.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={asset.alt ?? asset.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">
                        {asset.mimeType}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-semibold text-foreground">{asset.filename}</p>
                    <p className="text-xs text-muted">
                      {MEDIA_FOLDER_LABELS[asset.folder] ?? asset.folder} · {formatBytes(asset.sizeBytes)}
                    </p>
                    {isPickerMode ? (
                      <button
                        type="button"
                        className="btn-gold mt-2 w-full py-2 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectForPicker(asset.url);
                        }}
                      >
                        انتخاب این تصویر
                      </button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {data ? (
            <PaginationBar
              page={data.page}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        <Card className="h-fit border-[var(--border-subtle)] bg-[var(--card)] p-5 lg:sticky lg:top-24">
          <h3 className="font-semibold text-foreground">جزئیات پیوست</h3>
          {!selected ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              یک تصویر را انتخاب کنید تا جزئیات، متن جایگزین و لینک آن را ببینید.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.url}
                  alt={selected.alt ?? selected.filename}
                  className="aspect-video w-full object-cover"
                />
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">نام فایل</dt>
                  <dd className="font-medium">{selected.filename}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">پوشه</dt>
                  <dd>{MEDIA_FOLDER_LABELS[selected.folder] ?? selected.folder}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">حجم</dt>
                  <dd>{formatBytes(selected.sizeBytes)}</dd>
                </div>
              </dl>
              <div>
                <Label htmlFor="media-alt">متن جایگزین (Alt)</Label>
                <Input
                  id="media-alt"
                  className="mt-1"
                  value={altDraft}
                  onChange={(e) => setAltDraft(e.target.value)}
                  placeholder="توضیح تصویر برای SEO و دسترس‌پذیری"
                />
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  disabled={updateAlt.isPending}
                  onClick={() => updateAlt.mutate({ id: selected.id, alt: altDraft })}
                >
                  {updateAlt.isPending ? 'در حال ذخیره…' : 'ذخیره Alt'}
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void copyUrl(selected.id, selected.url)}
                >
                  {copiedId === selected.id ? 'کپی شد!' : 'کپی آدرس فایل'}
                </Button>
                {isPickerMode ? (
                  <Button size="sm" onClick={() => selectForPicker(selected.url)}>
                    انتخاب برای فرم
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[var(--error)]"
                    onClick={() => {
                      if (confirm('حذف این فایل از کتابخانه؟')) {
                        deleteMutation.mutate(selected.id);
                      }
                    }}
                  >
                    حذف از کتابخانه
                  </Button>
                )}
              </div>
              <p className="text-[10px] leading-5 text-muted" dir="ltr">
                {selected.url}
              </p>
            </div>
          )}
        </Card>
      </div>
    </CmsPageShell>
  );
}
