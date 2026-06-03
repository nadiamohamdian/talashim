'use client';

import { useEffect, useState } from 'react';
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
import type { CmsStaticPageDto } from '@talashim/types';
import {
  createStaticPage,
  deleteStaticPage,
  fetchStaticPages,
  updateStaticPage,
  type UpsertStaticPagePayload,
} from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';

const emptyPage = (): UpsertStaticPagePayload => ({
  title: '',
  slug: '',
  content: '',
  isPublished: false,
});

export function StaticPagesPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<CmsStaticPageDto | null | 'new'>(null);
  const [form, setForm] = useState<UpsertStaticPagePayload>(emptyPage());
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.pages(page, search),
    queryFn: () => fetchStaticPages({ page, search: search || undefined }),
  });

  useEffect(() => {
    if (editing && editing !== 'new') {
      setForm({
        title: editing.title,
        slug: editing.slug,
        content: editing.content,
        metaTitle: editing.metaTitle ?? '',
        metaDescription: editing.metaDescription ?? '',
        isPublished: editing.isPublished,
      });
    } else if (editing === 'new') {
      setForm(emptyPage());
    }
  }, [editing]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'pages'] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: UpsertStaticPagePayload) => {
      if (editing && editing !== 'new') {
        return updateStaticPage(editing.id, payload);
      }
      return createStaticPage(payload);
    },
    onSuccess: () => {
      setEditing(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaticPage,
    onSuccess: invalidate,
  });

  return (
    <CmsPageShell
      routeId="cms.pages"
      actions={
        <Button type="button" onClick={() => setEditing('new')}>
          صفحه جدید
        </Button>
      }
    >
      {editing ? (
        <Card className="space-y-4 border-border bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>عنوان</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>slug</Label>
              <Input
                className="mt-1 font-mono text-sm"
                dir="ltr"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div>
              <Label>meta title</Label>
              <Input
                className="mt-1"
                value={form.metaTitle ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                id="page-published"
                type="checkbox"
                checked={form.isPublished ?? false}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              <Label htmlFor="page-published">منتشر شده</Label>
            </div>
            <div className="md:col-span-2">
              <Label>meta description</Label>
              <Input
                className="mt-1"
                value={form.metaDescription ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaDescription: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>محتوا (HTML/Markdown)</Label>
              <textarea
                className="mt-1 min-h-[200px] w-full rounded-2xl border border-border p-3 text-sm"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
              ذخیره
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              انصراف
            </Button>
          </div>
        </Card>
      ) : null}

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
          />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری صفحات ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>slug</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">
                    {row.slug}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.isPublished
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {row.isPublished ? 'منتشر' : 'پیش‌نویس'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        className="h-8 px-3 text-xs"
                        variant="outline"
                        onClick={() => setEditing(row)}
                      >
                        ویرایش
                      </Button>
                      <Button
                        className="h-8 px-3 text-xs text-rose-600"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('حذف صفحه؟')) {
                            deleteMutation.mutate(row.id);
                          }
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

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
