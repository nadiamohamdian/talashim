'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
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
import {
  createProductVideo,
  deleteProductVideo,
  fetchProductVideos,
  updateProductVideo,
} from '../api/commerce-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CatalogPageShell } from './catalog-page-shell';

const emptyVideo = {
  title: '',
  videoUrl: '',
  thumbnailUrl: '',
  productId: '',
  sortOrder: '0',
};

export function ProductVideosPanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyVideo);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.commerce.videos(page, search),
    queryFn: () => fetchProductVideos({ page, search: search || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = {
        title: form.title,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl || undefined,
        productId: form.productId || undefined,
        sortOrder: Number(form.sortOrder),
      };
      return editingId
        ? updateProductVideo(editingId, body)
        : createProductVideo(body);
    },
    onSuccess: () => {
      setForm(emptyVideo);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'videos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductVideo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'videos'] }),
  });

  return (
    <CatalogPageShell routeId="products.videos">
      <Card className="border-border bg-white p-6">
        <h3 className="font-medium">{editingId ? 'ویرایش ویدیو' : 'ویدیو جدید'}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>شناسه محصول (اختیاری)</Label>
            <Input className="mt-1" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>URL ویدیو</Label>
            <Input className="mt-1" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          </div>
          <div>
            <Label>تصویر بندانگشتی</Label>
            <Input className="mt-1" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
          </div>
          <div>
            <Label>ترتیب</Label>
            <Input className="mt-1" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="h-9 px-3 text-xs" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'ذخیره' : 'افزودن'}
          </Button>
          {editingId ? (
            <Button variant="ghost" className="h-9 px-3 text-xs" onClick={() => { setEditingId(null); setForm(emptyVideo); }}>
              انصراف
            </Button>
          ) : null}
        </div>
      </Card>

      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input className="mt-1" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری ویدیوها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>محصول</TableHead>
                <TableHead>ترتیب</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>{video.title}</TableCell>
                  <TableCell className="text-sm text-stone-600">{video.productTitle ?? '—'}</TableCell>
                  <TableCell>{video.sortOrder}</TableCell>
                  <TableCell className="gap-2 space-x-2 space-x-reverse">
                    <button
                      type="button"
                      className="text-xs text-gold-dark"
                      onClick={() => {
                        setEditingId(video.id);
                        setForm({
                          title: video.title,
                          videoUrl: video.videoUrl,
                          thumbnailUrl: video.thumbnailUrl ?? '',
                          productId: video.productId ?? '',
                          sortOrder: String(video.sortOrder),
                        });
                      }}
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      className="text-xs text-rose-600"
                      onClick={() => deleteMutation.mutate(video.id)}
                    >
                      حذف
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {data ? (
        <PaginationBar page={data.page} total={data.total} limit={data.limit} onPageChange={setPage} />
      ) : null}
    </CatalogPageShell>
  );
}
