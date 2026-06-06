'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Input, Label, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@talashim/ui';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import {
  createFaqEntry,
  deleteFaqEntry,
  fetchAdminFaq,
  updateFaqEntry,
  type UpsertFaqPayload,
} from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { FaqEditorForm } from './faq-editor-form';
import type { AdminBlogPostDto } from '@talashim/types';

export function FaqPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminBlogPostDto | null | 'new'>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.faq(page, search),
    queryFn: () => fetchAdminFaq({ page, search: search || undefined }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'faq'] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: UpsertFaqPayload) => {
      if (editing && editing !== 'new') {
        return updateFaqEntry(editing.id, payload);
      }
      return createFaqEntry(payload);
    },
    onSuccess: () => {
      setEditing(null);
      setSaveError(null);
      invalidate();
    },
    onError: (error) => {
      setSaveError(getApiErrorMessage(error, 'ذخیره سوال ناموفق بود.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaqEntry,
    onSuccess: invalidate,
  });

  return (
    <CmsPageShell
      routeId="cms.faq"
      actions={
        <Button type="button" onClick={() => { setEditing('new'); setSaveError(null); }}>
          سوال جدید
        </Button>
      }
    >
      {editing ? (
        <FaqEditorForm
          initial={editing === 'new' ? null : editing}
          onCancel={() => { setEditing(null); setSaveError(null); }}
          saving={saveMutation.isPending}
          errorMessage={saveError}
          onSave={async (payload) => {
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
          />
        </div>
      </FilterBar>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری FAQ ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>سوال</TableHead>
                <TableHead>ترتیب</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-0.5 text-caption line-clamp-1">{item.excerpt}</p>
                  </TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.isPublished
                          ? 'bg-[var(--success-bg)] text-[var(--success)]'
                          : 'bg-[var(--surface)] text-muted'
                      }`}
                    >
                      {item.isPublished ? 'فعال' : 'غیرفعال'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditing(item); setSaveError(null); }}
                      >
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[var(--error)]"
                        onClick={() => {
                          if (confirm('حذف این سوال؟')) {
                            deleteMutation.mutate(item.id);
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

      {data?.items.length === 0 && !isLoading ? (
        <Alert variant="info">هنوز سوالی ثبت نشده. با «سوال جدید» اولین مورد را اضافه کنید.</Alert>
      ) : null}

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
