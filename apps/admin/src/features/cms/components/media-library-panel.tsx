'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@sadafgold/ui';
import { deleteMediaAsset, fetchMediaAssets } from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { formatBytes, selectFieldClass } from '../lib/labels';

export function MediaLibraryPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.media(page, search, folder),
    queryFn: () =>
      fetchMediaAssets({
        page,
        limit: 24,
        search: search || undefined,
        folder: folder || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'media'] });
    },
  });

  return (
    <CmsPageShell
      routeId="media.library"
      actions={
        <Link
          href="/media/upload"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-800"
        >
          آپلود فایل
        </Link>
      }
    >
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
            placeholder="نام فایل یا URL"
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
            <option value="general">general</option>
            <option value="products">products</option>
            <option value="blog">blog</option>
            <option value="banners">banners</option>
          </select>
        </div>
      </FilterBar>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <p className="text-rose-600">بارگذاری رسانه ناموفق بود.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.items.map((asset) => (
            <Card key={asset.id} className="overflow-hidden border-border bg-white p-0">
              <div className="relative aspect-video bg-nude-100">
                {asset.mimeType.startsWith('image/') ? (
                  <img
                    src={asset.url}
                    alt={asset.alt ?? asset.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-500">
                    {asset.mimeType}
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium">{asset.filename}</p>
                <p className="text-xs text-stone-500">
                  {asset.folder} · {formatBytes(asset.sizeBytes)}
                </p>
                <Input
                  className="font-mono text-[10px]"
                  dir="ltr"
                  readOnly
                  value={asset.url}
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  className="h-8 w-full text-xs text-rose-600"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('حذف این فایل از کتابخانه؟')) {
                      deleteMutation.mutate(asset.id);
                    }
                  }}
                >
                  حذف
                </Button>
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
    </CmsPageShell>
  );
}
