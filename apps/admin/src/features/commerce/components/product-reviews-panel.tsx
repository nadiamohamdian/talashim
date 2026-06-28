'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminProductReviewItem, AdminProductReviewsGroupedResponse } from '@sadafgold/types';
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
import {
  createAdminProductReview,
  deleteAdminProductReview,
  fetchProductReviews,
  reviewProductReview,
  updateAdminProductReview,
} from '../api/commerce-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { formatPersianDate } from '@/shared/lib/format-date';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { CatalogPageShell } from './catalog-page-shell';

const STATUS_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'PENDING', label: 'در انتظار تأیید' },
  { value: 'APPROVED', label: 'تأیید شده' },
  { value: 'REJECTED', label: 'رد شده' },
] as const;

const statusBadgeClass: Record<string, string> = {
  PENDING: 'bg-[var(--warning-bg)] text-[var(--warning-foreground)] border-[var(--warning-border)]',
  APPROVED: 'bg-[var(--success-bg)] text-[var(--success)]',
  REJECTED: 'bg-[var(--error-bg)] text-[var(--error)]',
};

const selectFieldClass =
  'h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm';

const emptyCreateForm = () => ({
  productSlug: '',
  authorName: '',
  body: '',
  rating: '5',
  phone: '',
});

function isGroupedReviewsResponse(
  data: unknown,
): data is AdminProductReviewsGroupedResponse {
  return Boolean(data && typeof data === 'object' && 'groups' in data);
}

function summarizeGroupReviews(reviews: AdminProductReviewItem[]) {
  const pending = reviews.filter((review) => review.status === 'PENDING').length;
  const approved = reviews.filter((review) => review.status === 'APPROVED').length;
  const rejected = reviews.filter((review) => review.status === 'REJECTED').length;

  return { pending, approved, rejected };
}

type ReviewActionsProps = {
  item: AdminProductReviewItem;
  reviewMutation: {
    isPending: boolean;
    mutate: (vars: { id: string; next: 'APPROVED' | 'REJECTED' }) => void;
  };
  deleteMutation: { isPending: boolean; mutate: (id: string) => void };
  onEdit: (item: AdminProductReviewItem) => void;
};

function ReviewActions({ item, reviewMutation, deleteMutation, onEdit }: ReviewActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {item.status === 'PENDING' ? (
        <>
          <Button
            size="sm"
            disabled={reviewMutation.isPending}
            onClick={() => reviewMutation.mutate({ id: item.id, next: 'APPROVED' })}
          >
            تأیید
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={reviewMutation.isPending}
            onClick={() => reviewMutation.mutate({ id: item.id, next: 'REJECTED' })}
          >
            رد
          </Button>
        </>
      ) : null}
      {item.status === 'APPROVED' ? (
        <Button
          size="sm"
          variant="outline"
          disabled={reviewMutation.isPending}
          onClick={() => reviewMutation.mutate({ id: item.id, next: 'REJECTED' })}
        >
          لغو انتشار
        </Button>
      ) : null}
      {item.status === 'REJECTED' ? (
        <Button
          size="sm"
          disabled={reviewMutation.isPending}
          onClick={() => reviewMutation.mutate({ id: item.id, next: 'APPROVED' })}
        >
          تأیید مجدد
        </Button>
      ) : null}
      <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
        ویرایش
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-[var(--error)]"
        disabled={deleteMutation.isPending}
        onClick={() => {
          if (window.confirm('این نظر حذف شود؟')) {
            deleteMutation.mutate(item.id);
          }
        }}
      >
        حذف
      </Button>
    </div>
  );
}

export function ProductReviewsPanel() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState(initialSearch);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingReview, setEditingReview] = useState<AdminProductReviewItem | null>(null);
  const [editForm, setEditForm] = useState({ body: '', rating: '5', authorName: '', status: 'APPROVED' });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
      setStatus('');
      setPage(1);
    }
  }, [initialSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.commerce.reviews(page, status, search, true),
    queryFn: () =>
      fetchProductReviews({
        page,
        status: status || undefined,
        search: search || undefined,
        groupByProduct: true,
      }),
  });

  const groupedReviews = isGroupedReviewsResponse(data) ? data : null;

  const invalidateReviews = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'reviews'] });
  };

  const reviewMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'APPROVED' | 'REJECTED' }) =>
      reviewProductReview(id, { status: next }),
    onSuccess: invalidateReviews,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProductReview,
    onSuccess: () => {
      invalidateReviews();
      setShowCreateForm(false);
      setCreateForm(emptyCreateForm());
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateAdminProductReview>[1] }) =>
      updateAdminProductReview(id, body),
    onSuccess: () => {
      invalidateReviews();
      setEditingReview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProductReview,
    onSuccess: invalidateReviews,
  });

  const openEditDialog = (item: AdminProductReviewItem) => {
    setEditingReview(item);
    setEditForm({
      body: item.body,
      rating: String(item.rating),
      authorName: item.author === 'کاربر' ? '' : item.author,
      status: item.status,
    });
  };

  return (
    <CatalogPageShell routeId="products.reviews">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted-foreground)]">
          نمایش نظرات به‌تفکیک محصول — تأیید، ویرایش، حذف و ثبت نظر جدید
        </p>
        <Button type="button" variant="outline" onClick={() => setShowCreateForm((open) => !open)}>
          {showCreateForm ? 'بستن فرم' : '+ ثبت نظر جدید'}
        </Button>
      </div>

      {showCreateForm ? (
        <Card className="mb-4 border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>اسلاگ محصول *</Label>
              <Input
                className="mt-1"
                placeholder="demo-bracelet"
                value={createForm.productSlug}
                onChange={(e) => setCreateForm({ ...createForm, productSlug: e.target.value })}
              />
            </div>
            <div>
              <Label>نام نویسنده</Label>
              <Input
                className="mt-1"
                value={createForm.authorName}
                onChange={(e) => setCreateForm({ ...createForm, authorName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>متن نظر *</Label>
              <textarea
                className={`${selectFieldClass} mt-1 min-h-[96px] py-2`}
                value={createForm.body}
                onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })}
              />
            </div>
            <div>
              <Label>امتیاز (۱ تا ۵)</Label>
              <Input
                className="mt-1"
                type="number"
                min={1}
                max={5}
                value={createForm.rating}
                onChange={(e) => setCreateForm({ ...createForm, rating: e.target.value })}
              />
            </div>
            <div>
              <Label>موبایل (اختیاری)</Label>
              <Input
                className="mt-1"
                dir="ltr"
                placeholder="09123456789"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() =>
                createMutation.mutate({
                  productSlug: createForm.productSlug.trim(),
                  body: createForm.body.trim(),
                  rating: Number(createForm.rating),
                  authorName: createForm.authorName.trim() || undefined,
                  phone: createForm.phone.trim() || undefined,
                  status: 'APPROVED',
                })
              }
            >
              ثبت و انتشار
            </Button>
          </div>
        </Card>
      ) : null}

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
            <div className="space-y-4 p-4">
              {(groupedReviews?.groups ?? []).map((group) => {
                const statusSummary = summarizeGroupReviews(group.reviews);

                return (
                  <Card
                    key={group.product.id}
                    className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--divider)] bg-[var(--surface)] px-4 py-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${group.product.slug}/edit`}
                          className="text-base font-semibold text-[var(--primary)] hover:underline"
                        >
                          {group.product.title}
                        </Link>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {group.reviewCount.toLocaleString('fa-IR')} نظر
                          {group.reviewCount > 0
                            ? ` · میانگین امتیاز ${group.averageRating.toFixed(1)}`
                            : null}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statusSummary.pending > 0 ? (
                          <Badge className={statusBadgeClass.PENDING}>
                            {statusSummary.pending.toLocaleString('fa-IR')} در انتظار
                          </Badge>
                        ) : null}
                        {statusSummary.approved > 0 ? (
                          <Badge className={statusBadgeClass.APPROVED}>
                            {statusSummary.approved.toLocaleString('fa-IR')} تأییدشده
                          </Badge>
                        ) : null}
                        {statusSummary.rejected > 0 ? (
                          <Badge className={statusBadgeClass.REJECTED}>
                            {statusSummary.rejected.toLocaleString('fa-IR')} ردشده
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {group.reviews.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>نویسنده</TableHead>
                            <TableHead>متن</TableHead>
                            <TableHead>امتیاز</TableHead>
                            <TableHead>موبایل</TableHead>
                            <TableHead>وضعیت</TableHead>
                            <TableHead>تاریخ</TableHead>
                            <TableHead className="text-left">عملیات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.reviews.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="max-w-[120px] text-sm">{item.author}</TableCell>
                              <TableCell className="max-w-[320px]">
                                <p className="whitespace-pre-wrap text-sm leading-6">{item.body}</p>
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
                                <ReviewActions
                                  item={item}
                                  reviewMutation={reviewMutation}
                                  deleteMutation={deleteMutation}
                                  onEdit={openEditDialog}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="p-4 text-sm text-[var(--muted-foreground)]">
                        نظری برای این محصول یافت نشد.
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>

            {!groupedReviews?.groups.length ? (
              <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">
                محصولی با نظر مطابق فیلترها یافت نشد.
              </p>
            ) : null}

            <PaginationBar
              page={groupedReviews?.page ?? 1}
              total={groupedReviews?.total ?? 0}
              limit={groupedReviews?.limit ?? 20}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      {editingReview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg border-[var(--border-subtle)] bg-[var(--card)] p-4">
            <h3 className="mb-4 text-base font-medium">ویرایش نظر</h3>
            <div className="space-y-3">
              <div>
                <Label>نام نویسنده</Label>
                <Input
                  className="mt-1"
                  value={editForm.authorName}
                  onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                />
              </div>
              <div>
                <Label>متن نظر</Label>
                <textarea
                  className={`${selectFieldClass} mt-1 min-h-[96px] py-2`}
                  value={editForm.body}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>امتیاز</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    max={5}
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                  />
                </div>
                <div>
                  <Label>وضعیت</Label>
                  <select
                    className={`${selectFieldClass} mt-1`}
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingReview(null)}>
                انصراف
              </Button>
              <Button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: editingReview.id,
                    body: {
                      body: editForm.body.trim(),
                      rating: Number(editForm.rating),
                      authorName: editForm.authorName.trim() || undefined,
                      status: editForm.status as 'PENDING' | 'APPROVED' | 'REJECTED',
                    },
                  })
                }
              >
                ذخیره
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </CatalogPageShell>
  );
}
