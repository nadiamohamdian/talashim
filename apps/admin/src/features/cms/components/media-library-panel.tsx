'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@sadafgold/ui';
import { deleteMediaAsset, fetchMediaAssets, uploadMediaImage } from '../api/cms-api';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { AdminApiError } from '@/shared/ui/admin-api-error';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { formatBytes, selectFieldClass } from '../lib/labels';
import { setMediaPickerResult } from '../lib/media-picker-session';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export function MediaLibraryPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPickerMode = searchParams.get('picker') === '1';
  const accessToken = useAdminAuthStore((s) => s.accessToken);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState(searchParams.get('folder') ?? '');

  useEffect(() => {
    const fromQuery = searchParams.get('folder');
    if (fromQuery) {
      setFolder(fromQuery);
    }
  }, [searchParams]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: () => {
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
            روی «انتخاب این تصویر» بزنید تا به فرم محصول/محتوا برگردید.
          </p>
        </Card>
      ) : null}
      <Card className="border-[var(--warning-border)] bg-gradient-to-l from-[var(--warning-bg)] to-white p-6">
        <h3 className="text-sm font-bold text-foreground">آپلود تصاویر سایت</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          تمام تصاویر محصولات، بنرها، وبلاگ و صفحات از اینجا مدیریت می‌شوند. هنگام افزودن محصول یا
          محتوا، تصویر را از همین کتابخانه انتخاب کنید.
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
          <button
            type="button"
            className="btn-gold mt-4"
            disabled={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {upload.isPending ? 'در حال آپلود…' : 'انتخاب و آپلود تصویر'}
          </button>
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
            placeholder="نام فایل"
          />
        </div>
        <div>
          <Label>پوشه</Label>
          <select
            className={selectFieldClass}
            value={folder}
            onChange={(e) => {
              setFolder(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="general">عمومی</option>
            <option value="products">محصولات</option>
            <option value="blog">وبلاگ</option>
            <option value="banners">بنرها</option>
          </select>
        </div>
      </FilterBar>

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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.items.map((asset) => (
            <Card key={asset.id} className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0 shadow-sm">
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
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-semibold text-foreground">{asset.filename}</p>
                <p className="text-xs text-muted">
                  {asset.folder} · {formatBytes(asset.sizeBytes)}
                </p>
                <div className="flex flex-col gap-2">
                  {isPickerMode ? (
                    <button
                      type="button"
                      className="btn-gold w-full py-2 text-xs"
                      onClick={() => selectForPicker(asset.url)}
                    >
                      انتخاب این تصویر
                    </button>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-gold flex-1 py-2 text-xs"
                      onClick={() => void copyUrl(asset.id, asset.url)}
                    >
                      {copiedId === asset.id ? 'کپی شد!' : 'کپی URL'}
                    </button>
                    {!isPickerMode ? (
                      <Button
                        variant="outline"
                        className="h-auto px-3 py-2 text-xs text-[var(--error)]"
                        onClick={() => {
                          if (confirm('حذف این فایل از کتابخانه؟')) {
                            deleteMutation.mutate(asset.id);
                          }
                        }}
                      >
                        حذف
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {data ? (
        <PaginationBar page={data.page} total={data.total} limit={data.limit} onPageChange={setPage} />
      ) : null}
    </CmsPageShell>
  );
}
