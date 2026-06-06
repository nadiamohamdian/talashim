'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Label, Skeleton } from '@sadafgold/ui';
import { fetchMediaAssets, uploadMediaImage } from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { selectFieldClass } from '../lib/labels';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  folder?: string;
  title?: string;
}

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  folder: defaultFolder = '',
  title = 'انتخاب تصویر از کتابخانه',
}: MediaPickerDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState(defaultFolder);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminQueryKeys.cms.media(page, search, folder),
    queryFn: () =>
      fetchMediaAssets({
        page,
        limit: 24,
        search: search || undefined,
        folder: folder || undefined,
        mimeType: 'image/',
      }),
    enabled: open,
  });

  const upload = useMutation({
    mutationFn: (file: File) =>
      uploadMediaImage(file, { folder: folder || defaultFolder || 'general' }),
    onSuccess: (asset) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'media'] });
      onSelect(asset.url);
      onClose();
    },
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-border bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border bg-nude-50 px-5 py-4">
          <h2 id="media-picker-title" className="text-base font-bold text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-white"
            onClick={onClose}
          >
            بستن
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-stone-800">انتخاب از کتابخانه رسانه</p>
            <Link
              href={`/media?picker=1${folder ? `&folder=${encodeURIComponent(folder)}` : ''}`}
              className="text-sm font-semibold text-amber-800 underline"
              onClick={onClose}
            >
              باز کردن صفحه کتابخانه (/media)
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
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
          </div>

          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
              <p className="text-sm text-rose-700">{getApiErrorMessage(error)}</p>
              <p className="mt-2 text-xs text-stone-600">
                API را اجرا کنید:{' '}
                <code className="rounded bg-white px-1" dir="ltr">
                  pnpm dev:api
                </code>
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => void refetch()}>
                  تلاش مجدد
                </Button>
                <Link
                  href={`/media?picker=1${folder ? `&folder=${encodeURIComponent(folder)}` : ''}`}
                  className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm"
                  onClick={onClose}
                >
                  رفتن به /media
                </Link>
              </div>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-nude-50 p-6 text-center text-sm text-stone-600">
              <p>هنوز تصویری در کتابخانه نیست.</p>
              <Link
                href={`/media?picker=1${folder ? `&folder=${encodeURIComponent(folder)}` : ''}`}
                className="mt-2 inline-block font-semibold text-amber-800 underline"
                onClick={onClose}
              >
                رفتن به کتابخانه برای آپلود
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {data?.items.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="group overflow-hidden rounded-xl border border-border bg-nude-50 text-right transition hover:border-amber-500 hover:ring-2 hover:ring-amber-200"
                  onClick={() => {
                    onSelect(asset.url);
                    onClose();
                  }}
                >
                  <div className="aspect-square overflow-hidden bg-nude-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.alt ?? asset.filename}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <p className="truncate px-2 py-1.5 text-[10px] font-medium text-stone-700">
                    {asset.filename}
                  </p>
                </button>
              ))}
            </div>
          )}

          {data && data.total > data.limit ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                قبلی
              </Button>
              <span className="text-xs text-stone-500">
                صفحه {data.page.toLocaleString('fa-IR')}
              </span>
              <Button
                variant="outline"
                disabled={page * data.limit >= data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                بعدی
              </Button>
            </div>
          ) : null}

          <div
            className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-5 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file?.type.startsWith('image/')) {
                upload.mutate(file);
              }
            }}
          >
            <p className="text-sm font-medium text-stone-700">یا آپلود از کامپیوتر</p>
            <p className="mt-1 text-xs text-stone-500">فایل را بکشید و رها کنید</p>
            <button
              type="button"
              className="mt-3 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-nude-50"
              disabled={upload.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {upload.isPending ? 'در حال آپلود…' : 'آپلود از کامپیوتر'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  upload.mutate(file);
                }
                e.target.value = '';
              }}
            />
            {upload.isError ? (
              <p className="mt-2 text-xs text-rose-600">{getApiErrorMessage(upload.error)}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
