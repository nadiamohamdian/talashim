'use client';

import { formatPersianDate } from '@/shared/lib/format-date';

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
  createBlogPost,
  deleteBlogPost,
  fetchAdminBlogPosts,
  fetchBlogCategories,
  updateBlogPost,
} from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { PostEditorForm } from './post-editor-form';
import { selectFieldClass } from '../lib/labels';
import type { AdminBlogPostDto } from '@talashim/types';
import { getApiErrorMessage } from '@/shared/api/axios-client';

export function BlogPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [published, setPublished] = useState('all');
  const [editing, setEditing] = useState<AdminBlogPostDto | null | 'new'>(null);
  const queryClient = useQueryClient();

  const categories = useQuery({
    queryKey: adminQueryKeys.cms.blogCategories,
    queryFn: fetchBlogCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.blog(page, search, published),
    queryFn: () =>
      fetchAdminBlogPosts({
        page,
        search: search || undefined,
        published: published === 'all' ? undefined : published,
      }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'blog'] });
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof createBlogPost>[0]) => {
      if (editing && editing !== 'new') {
        return updateBlogPost(editing.id, payload);
      }
      return createBlogPost(payload);
    },
    onSuccess: () => {
      setSaveError(null);
      setEditing(null);
      invalidate();
    },
    onError: (error: unknown) => {
      setSaveError(getApiErrorMessage(error, 'ذخیره پست ناموفق بود'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: invalidate,
  });

  return (
    <CmsPageShell
      routeId="cms.blog"
      actions={
        <Button type="button" onClick={() => setEditing('new')}>
          پست جدید
        </Button>
      }
    >
      {editing ? (
        <PostEditorForm
          categories={categories.data ?? []}
          initial={editing === 'new' ? null : editing}
          onCancel={() => {
            setSaveError(null);
            setEditing(null);
          }}
          saving={saveMutation.isPending}
          saveError={saveError}
          onSave={async (payload) => {
            setSaveError(null);
            await saveMutation.mutateAsync(payload);
          }}
        />
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
            placeholder="عنوان یا slug"
          />
        </div>
        <div>
          <Label>وضعیت انتشار</Label>
          <select
            className={selectFieldClass}
            value={published}
            onChange={(e) => {
              setPublished(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">همه</option>
            <option value="true">منتشرشده</option>
            <option value="false">پیش‌نویس</option>
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری وبلاگ ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>دسته</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <p className="font-medium">{post.title}</p>
                    <p className="font-mono text-xs text-muted" dir="ltr">
                      {post.slug}
                    </p>
                  </TableCell>
                  <TableCell>{post.categoryTitle ?? '—'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.isPublished
                          ? 'bg-[var(--success-bg)] text-[var(--success)]'
                          : 'bg-[var(--surface)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      {post.isPublished ? 'منتشر' : 'پیش‌نویس'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatPersianDate(post.publishedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        className="h-8 px-3 text-xs"
                        variant="outline"
                        onClick={() => setEditing(post)}
                      >
                        ویرایش
                      </Button>
                      <Button
                        className="h-8 px-3 text-xs text-[var(--error)]"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('حذف این پست؟')) {
                            deleteMutation.mutate(post.id);
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
