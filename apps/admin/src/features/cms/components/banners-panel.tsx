'use client';

import { useEffect, useMemo, useState } from 'react';
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
import type { CmsBannerDto } from '@talashim/types';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import {
  createBanner,
  deleteBanner,
  fetchBanners,
  updateBanner,
  type UpsertBannerPayload,
} from '../api/cms-api';
import { ImageUrlField } from './image-url-field';
import { BannerProductPicker } from './banner-product-picker';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CmsPageShell } from './cms-page-shell';
import { BANNER_LINK_TYPE_FA, BANNER_PLACEMENT_FA, BANNER_STATUS_FA, selectFieldClass } from '../lib/labels';
import { validateLibraryImageUrl } from '../lib/validate-library-image';
import { PersianDatePicker } from '@/shared/ui/persian-date-picker';

const emptyBanner = (): UpsertBannerPayload => ({
  title: '',
  subtitle: '',
  imageUrl: '',
  linkType: 'URL',
  linkUrl: '/products',
  productIds: [],
  placement: 'HOME_MID',
  status: 'PUBLISHED',
  sortOrder: 0,
});

function validateBannerForm(form: UpsertBannerPayload): string | null {
  if (form.title.trim().length < 2) {
    return 'عنوان باید حداقل ۲ کاراکتر باشد.';
  }
  const imageError = validateLibraryImageUrl(form.imageUrl, 'تصویر بنر');
  if (imageError) {
    return imageError;
  }
  if (form.linkType === 'COLLECTION' && (form.productIds?.length ?? 0) === 0) {
    return 'برای مجموعه محصولات، حداقل یک محصول انتخاب کنید.';
  }
  if (form.startsAt && form.endsAt && form.startsAt > form.endsAt) {
    return 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.';
  }
  return null;
}

function toApiPayload(form: UpsertBannerPayload): UpsertBannerPayload {
  const linkType = form.linkType ?? 'URL';

  return {
    title: form.title.trim(),
    subtitle: form.subtitle?.trim() || undefined,
    imageUrl: form.imageUrl.trim(),
    linkType,
    linkUrl: linkType === 'URL' ? form.linkUrl?.trim() || undefined : undefined,
    productIds: linkType === 'COLLECTION' ? form.productIds ?? [] : undefined,
    placement: form.placement,
    status: form.status,
    sortOrder: form.sortOrder ?? 0,
    startsAt: form.startsAt || undefined,
    endsAt: form.endsAt || undefined,
  };
}

export function BannersPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [placement, setPlacement] = useState('');
  const [editing, setEditing] = useState<CmsBannerDto | null | 'new'>(null);
  const [form, setForm] = useState<UpsertBannerPayload>(emptyBanner());
  const [formError, setFormError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => adminQueryKeys.cms.banners(page, status, placement),
    [page, status, placement],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      fetchBanners({
        page,
        status: status || undefined,
        placement: placement || undefined,
      }),
  });

  useEffect(() => {
    if (editing && editing !== 'new') {
      setForm({
        title: editing.title,
        subtitle: editing.subtitle ?? '',
        imageUrl: editing.imageUrl,
        linkType: editing.linkType ?? 'URL',
        linkUrl: editing.linkUrl ?? '',
        productIds: editing.productIds ?? [],
        placement: editing.placement,
        status: editing.status,
        sortOrder: editing.sortOrder,
        startsAt: editing.startsAt?.slice(0, 10),
        endsAt: editing.endsAt?.slice(0, 10),
      });
      setFormError(null);
    } else if (editing === 'new') {
      setForm(emptyBanner());
      setFormError(null);
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
      setFormError(null);
      setSaveMessage('بنر با موفقیت ذخیره شد و در فروشگاه (در صورت انتشار) نمایش داده می‌شود.');
      invalidate();
    },
    onError: (error) => {
      setSaveMessage(null);
      setFormError(getApiErrorMessage(error, 'ذخیره بنر ناموفق بود.'));
    },
  });

  const quickStatusMutation = useMutation({
    mutationFn: ({
      banner,
      nextStatus,
    }: {
      banner: CmsBannerDto;
      nextStatus: CmsBannerDto['status'];
    }) =>
      updateBanner(banner.id, {
        title: banner.title,
        subtitle: banner.subtitle ?? undefined,
        imageUrl: banner.imageUrl,
        linkType: banner.linkType ?? 'URL',
        linkUrl: banner.linkUrl ?? undefined,
        productIds: banner.productIds ?? [],
        placement: banner.placement,
        status: nextStatus,
        sortOrder: banner.sortOrder,
        startsAt: banner.startsAt?.slice(0, 10),
        endsAt: banner.endsAt?.slice(0, 10),
      }),
    onSuccess: () => {
      setSaveMessage('وضعیت بنر به‌روز شد.');
      invalidate();
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, 'تغییر وضعیت ناموفق بود.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      setSaveMessage('بنر حذف شد.');
      invalidate();
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, 'حذف بنر ناموفق بود.'));
    },
  });

  const handleSave = () => {
    const validationError = validateBannerForm(form);
    if (validationError) {
      setFormError(validationError);
      setSaveMessage(null);
      return;
    }
    saveMutation.mutate(toApiPayload(form));
  };

  return (
    <CmsPageShell
      routeId="cms.banners"
      actions={
        <Button type="button" onClick={() => setEditing('new')}>
          بنر جدید
        </Button>
      }
    >
      {saveMessage ? <Alert variant="success">{saveMessage}</Alert> : null}
      {formError && !editing ? <Alert variant="destructive">{formError}</Alert> : null}

      {editing ? (
        <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">
                {editing === 'new' ? 'بنر جدید' : 'ویرایش بنر'}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                برای نمایش در سایت، وضعیت را «منتشرشده» بگذارید و تصویر را از کتابخانه انتخاب کنید.
              </p>
            </div>
            {form.imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="پیش‌نمایش"
                  className="h-24 w-40 object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>عنوان *</Label>
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
              <Label>جایگاه نمایش</Label>
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
            <div>
              <Label>ترتیب نمایش</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label>نوع مقصد</Label>
              <select
                className={selectFieldClass}
                value={form.linkType ?? 'URL'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    linkType: e.target.value as UpsertBannerPayload['linkType'],
                  }))
                }
              >
                {Object.entries(BANNER_LINK_TYPE_FA).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {form.linkType === 'URL' ? (
              <div>
                <Label>لینک مقصد</Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  dir="ltr"
                  placeholder="/products"
                  value={form.linkUrl ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                />
              </div>
            ) : null}
            <div>
              <PersianDatePicker
                label="شروع نمایش (اختیاری)"
                value={form.startsAt ?? ''}
                onChange={(startsAt) => setForm((f) => ({ ...f, startsAt }))}
              />
            </div>
            <div>
              <PersianDatePicker
                label="پایان نمایش (اختیاری)"
                value={form.endsAt ?? ''}
                onChange={(endsAt) => setForm((f) => ({ ...f, endsAt }))}
              />
            </div>
            <div className="md:col-span-2">
              <ImageUrlField
                label="تصویر بنر"
                hint="تصویر را از کتابخانه رسانه انتخاب کنید. بدون تصویر، بنر ذخیره نمی‌شود."
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                folder="banners"
                required
              />
            </div>
            {form.linkType === 'COLLECTION' ? (
              <div className="md:col-span-2">
                <BannerProductPicker
                  value={form.productIds ?? []}
                  onChange={(productIds) => setForm((f) => ({ ...f, productIds }))}
                />
              </div>
            ) : null}
          </div>

          {formError ? <Alert variant="destructive">{formError}</Alert> : null}

          <div className="flex gap-2">
            <Button disabled={saveMutation.isPending} onClick={handleSave}>
              {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره بنر'}
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
        <div>
          <Label>جایگاه</Label>
          <select
            className={selectFieldClass}
            value={placement}
            onChange={(e) => {
              setPlacement(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(BANNER_PLACEMENT_FA).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری بنرها ناموفق بود.</p>
        ) : data?.items.length === 0 ? (
          <p className="p-6 text-sm text-[var(--muted-foreground)]">
            بنری ثبت نشده. «بنر جدید» را بزنید — برای نمایش در سایت وضعیت «منتشرشده» و تصویر الزامی
            است.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تصویر</TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead>جایگاه</TableHead>
                <TableHead>مقصد</TableHead>
                <TableHead>ترتیب</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-44" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-12 w-20 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{banner.title}</p>
                    {banner.subtitle ? (
                      <p className="mt-0.5 text-xs text-muted">{banner.subtitle}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>{BANNER_PLACEMENT_FA[banner.placement]}</TableCell>
                  <TableCell>
                    {banner.linkType === 'COLLECTION' ? (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {banner.productIds.length} محصول
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-[var(--muted-foreground)]" dir="ltr">
                        {banner.linkUrl ?? '—'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{banner.sortOrder}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                      {BANNER_STATUS_FA[banner.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        className="h-8 px-3 text-xs"
                        variant="outline"
                        onClick={() => setEditing(banner)}
                      >
                        ویرایش
                      </Button>
                      {banner.status !== 'PUBLISHED' ? (
                        <Button
                          className="h-8 px-3 text-xs"
                          variant="outline"
                          disabled={quickStatusMutation.isPending}
                          onClick={() =>
                            quickStatusMutation.mutate({ banner, nextStatus: 'PUBLISHED' })
                          }
                        >
                          انتشار
                        </Button>
                      ) : (
                        <Button
                          className="h-8 px-3 text-xs"
                          variant="outline"
                          disabled={quickStatusMutation.isPending}
                          onClick={() =>
                            quickStatusMutation.mutate({ banner, nextStatus: 'DRAFT' })
                          }
                        >
                          پیش‌نویس
                        </Button>
                      )}
                      <Button
                        className="h-8 px-3 text-xs text-[var(--error)]"
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
