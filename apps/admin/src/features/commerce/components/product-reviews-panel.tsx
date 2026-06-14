'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
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
import { fetchProductReviews, reviewProductReview } from '../api/commerce-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { formatPersianDate } from '@/shared/lib/format-date';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CatalogPageShell } from './catalog-page-shell';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'در انتظار تأیید' },
  { value: 'APPROVED', label: 'تأیید شده' },
  { value: 'REJECTED', label: 'رد شده' },
  { value: '', label: 'همه' },
] as const;

const statusBadgeClass: Record<string, string> = {
  PENDING: 'bg-[var(--warning-bg)] text-[var(--warning-foreground)] border-[var(--warning-border)]',
  APPROVED: 'bg-[var(--success-bg)] text-[var(--success)]',
  REJECTED: 'bg-[var(--error-bg)] text-[var(--error)]',
};

const selectFieldClass =
  'h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm';

export function ProductReviewsPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.commerce.reviews(page, status, search),
    queryFn: () =>
      fetchProductReviews({
        page,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'APPROVED' | 'REJECTED' }) =>
      reviewProductReview(id, { status: next }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'reviews'] });
    },
  });

  return (
    <CatalogPageShell routeId="products.reviews">
      <FilterBar>
        <div>
          <Label>وضعیت</Label>
          <select
            className={`${selectFieldClass} mt-1`}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[220px] flex-1">
          <Label>جستجو</Label>
          <Input
            className="mt-1"
            placeholder="متن، محصول یا موبایل"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری نظرات محصول ناموفق بود.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>محصول</TableHead>
                  <TableHead>متن</TableHead>
                  <TableHead>امتیاز</TableHead>
                  <TableHead>موبایل</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[160px]">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="line-clamp-2 text-[var(--primary)] hover:underline"
                      >
                        {item.product.title}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="line-clamp-3 text-sm leading-6">{item.body}</p>
                    </TableCell>
                    <TableCell>{item.rating.toFixed(1)}</TableCell>
                    <TableCell dir="ltr" className="text-left">
                      {item.phoneMasked}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusBadgeClass[item.status] ??
                          'bg-[var(--surface)] text-[var(--muted-foreground)]'
                        }
                      >
                        {STATUS_OPTIONS.find((option) => option.value === item.status)?.label ??
                          item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPersianDate(item.createdAt)}</TableCell>
                    <TableCell>
                      {item.status === 'PENDING' ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={reviewMutation.isPending}
                            onClick={() =>
                              reviewMutation.mutate({ id: item.id, next: 'APPROVED' })
                            }
                          >
                            تأیید
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={reviewMutation.isPending}
                            onClick={() =>
                              reviewMutation.mutate({ id: item.id, next: 'REJECTED' })
                            }
                          >
                            رد
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--muted-foreground)]">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!data?.items.length ? (
              <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">
                نظری برای نمایش وجود ندارد.
              </p>
            ) : null}

            <PaginationBar
              page={data?.page ?? 1}
              total={data?.total ?? 0}
              limit={data?.limit ?? 20}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </CatalogPageShell>
  );
}
