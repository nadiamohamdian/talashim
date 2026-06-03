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
import type { CmsBannerDto } from '@talashim/types';
import {
  createBanner,
  deleteBanner,
  fetchBanners,
  updateBanner,
  type UpsertBannerPayload,
} from '../api/cms-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { BANNER_PLACEMENT_FA, BANNER_STATUS_FA, selectFieldClass } from '../lib/labels';

const emptyBanner = (): UpsertBannerPayload => ({
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '/products',
  placement: 'HOME_MID',
  status: 'DRAFT',
  sortOrder: 0,
});

export function BannersPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<CmsBannerDto | null | 'new'>(null);
  const [form, setForm] = useState<UpsertBannerPayload>(emptyBanner());
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.cms.banners(page, status),
    queryFn: () =>
      fetchBanners({
        page,
        status: status || undefined,
      }),
  });

  useEffect(() => {
    if (editing && editing !== 'new') {
      setForm({
        title: editing.title,
        subtitle: editing.subtitle ?? '',
        imageUrl: editing.imageUrl,
        linkUrl: editing.linkUrl ?? '',
        placement: editing.placement,
        status: editing.status,
        sortOrder: editing.sortOrder,
        startsAt: editing.startsAt?.slice(0, 10),
        endsAt: editing.endsAt?.slice(0, 10),
      });
    } else if (editing === 'new') {
      setForm(emptyBanner());
    }
  }, [editing]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'banners'] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: UpsertBannerPayload) => {
      if (editing && editing !== 'new') {
        return updateBanner(editing.id, payload);
      }
      return createBanner(payload);
    },
    onSuccess: () => {
      setEditing(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: invalidate,
  });

  return (
    <CmsPageShell
      routeId="cms.banners"
      actions={
        <Button type="button" onClick={() => setEditing('new')}>
          بنر جدید
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
              <Label>زیرعنوان</Label>
              <Input
                className="mt-1"
                value={form.subtitle ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
            </div>
            <div>
              <Label>جایگاه</Label>
              <select
                className={selectFieldClass}
                value={form.placement}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    placement: e.target.value as UpsertBannerPayload['placement'],
                  }))
                }
              >
                {Object.entries(BANNER_PLACEMENT_FA).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>وضعیت</Label>
              <select
                className={selectFieldClass}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as UpsertBannerPayload['status'],
                  }))
                }
              >
                {Object.entries(BANNER_STATUS_FA).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>تصویر (URL)</Label>
              <Input
                className="mt-1 font-mono text-xs"
                dir="ltr"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>لینک</Label>
              <Input
                className="mt-1 font-mono text-sm"
                dir="ltr"
                value={form.linkUrl ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
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
        <div>
          <Label>وضعیت</Label>
          <select
            className={selectFieldClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="PUBLISHED">منتشرشده</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="ARCHIVED">بایگانی</option>
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری بنرها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>جایگاه</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>{banner.title}</TableCell>
                  <TableCell>{BANNER_PLACEMENT_FA[banner.placement]}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                      {BANNER_STATUS_FA[banner.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        className="h-8 px-3 text-xs"
                        variant="outline"
                        onClick={() => setEditing(banner)}
                      >
                        ویرایش
                      </Button>
                      <Button
                        className="h-8 px-3 text-xs text-rose-600"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('حذف بنر؟')) {
                            deleteMutation.mutate(banner.id);
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
