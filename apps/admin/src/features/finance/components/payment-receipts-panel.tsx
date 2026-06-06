'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@talashim/ui';
import type { AdminPaymentReceiptItem } from '@talashim/types';
import { formatPersianDateTime } from '@/shared/lib/format-date';
import {
  ReceiptPreview,
  downloadReceipt,
  receiptFilenameFromUrl,
} from '@/shared/ui/receipt-preview';
import {
  approveAdminPaymentReceipt,
  rejectAdminPaymentReceipt,
} from '@/features/commerce/api/commerce-api';
import { PAYMENT_STATUS_FA, formatToman } from '@/features/commerce/lib/labels';
import { fetchPaymentReceipts } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { selectFieldClass } from '../lib/labels';

const RECEIPT_STATUS_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'RECEIPT_SUBMITTED', label: 'در انتظار بررسی' },
  { value: 'PAID', label: 'تأیید شده' },
  { value: 'AWAITING_RECEIPT', label: 'در انتظار فیش جدید' },
  { value: 'REJECTED', label: 'رد شده' },
];

export function PaymentReceiptsPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<AdminPaymentReceiptItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const receiptsQuery = useQuery({
    queryKey: adminQueryKeys.paymentReceipts(page, status),
    queryFn: () => fetchPaymentReceipts({ page, status: status || undefined }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ orderId, paymentId }: { orderId: string; paymentId: string }) =>
      approveAdminPaymentReceipt(orderId, paymentId),
    onSuccess: () => {
      setActionMessage('فیش تأیید شد.');
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'payment-receipts'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'orders'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      orderId,
      paymentId,
      reason,
    }: {
      orderId: string;
      paymentId: string;
      reason: string;
    }) => rejectAdminPaymentReceipt(orderId, paymentId, reason),
    onSuccess: () => {
      setActionMessage('فیش رد شد.');
      setSelected(null);
      setRejectReason('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'payment-receipts'] });
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">
        فیش‌های واریز کارت‌به‌کارت ارسال‌شده توسط مشتریان. برای تأیید یا رد، فیش را باز کنید یا به
        جزئیات سفارش بروید.
      </p>

      {actionMessage ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionMessage}
        </p>
      ) : null}

      <FilterBar>
        <div>
          <Label>وضعیت پرداخت</Label>
          <select
            className={selectFieldClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {RECEIPT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {receiptsQuery.isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : receiptsQuery.isError ? (
          <p className="p-6 text-rose-600">بارگذاری فیش‌ها ناموفق بود.</p>
        ) : receiptsQuery.data?.items.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">فیشی ثبت نشده است.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>سفارش</TableHead>
                <TableHead>مشتری</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>زمان ارسال</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receiptsQuery.data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/orders/${item.orderId}`}
                      className="font-mono text-xs text-amber-800 underline"
                    >
                      {item.order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{item.order.user?.fullName ?? '—'}</TableCell>
                  <TableCell>{formatToman(item.amountToman)} تومان</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PAYMENT_STATUS_FA[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.receiptUploadedAt
                      ? formatPersianDateTime(item.receiptUploadedAt)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setSelected(item)}>
                        مشاهده فیش
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          downloadReceipt(
                            item.receiptUrl,
                            receiptFilenameFromUrl(item.receiptUrl, `receipt-${item.order.orderNumber}`),
                          )
                        }
                      >
                        دانلود
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {receiptsQuery.data ? (
        <PaginationBar
          page={receiptsQuery.data.page}
          total={receiptsQuery.data.total}
          limit={receiptsQuery.data.limit}
          onPageChange={setPage}
        />
      ) : null}

      {selected ? (
        <ReceiptDetailDialog
          item={selected}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          onClose={() => {
            setSelected(null);
            setRejectReason('');
          }}
          onDownload={() =>
            downloadReceipt(
              selected.receiptUrl,
              receiptFilenameFromUrl(selected.receiptUrl, `receipt-${selected.order.orderNumber}`),
            )
          }
          onApprove={() =>
            approveMutation.mutate({ orderId: selected.orderId, paymentId: selected.id })
          }
          onReject={() =>
            rejectMutation.mutate({
              orderId: selected.orderId,
              paymentId: selected.id,
              reason: rejectReason.trim() || 'فیش نامعتبر است',
            })
          }
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      ) : null}
    </div>
  );
}

interface ReceiptDetailDialogProps {
  item: AdminPaymentReceiptItem;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function ReceiptDetailDialog({
  item,
  rejectReason,
  onRejectReasonChange,
  onClose,
  onDownload,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ReceiptDetailDialogProps) {
  const canReview = item.status === 'RECEIPT_SUBMITTED';

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
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border bg-nude-50 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">فیش پرداخت</h2>
            <p className="mt-1 font-mono text-xs text-stone-500">{item.order.orderNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-stone-600 hover:bg-stone-100"
          >
            بستن
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">مشتری</dt>
              <dd>{item.order.user?.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-stone-500">مبلغ</dt>
              <dd>{formatToman(item.amountToman)} تومان</dd>
            </div>
            <div>
              <dt className="text-stone-500">وضعیت</dt>
              <dd>{PAYMENT_STATUS_FA[item.status] ?? item.status}</dd>
            </div>
            <div>
              <dt className="text-stone-500">زمان ارسال</dt>
              <dd>
                {item.receiptUploadedAt
                  ? formatPersianDateTime(item.receiptUploadedAt)
                  : '—'}
              </dd>
            </div>
          </dl>

          {item.rejectionReason ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              دلیل رد: {item.rejectionReason}
            </p>
          ) : null}

          <ReceiptPreview url={item.receiptUrl} maxHeightClass="max-h-[50vh]" />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onDownload}>
              دانلود فیش
            </Button>
            <a
              href={item.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-[var(--radius-lg,0.75rem)] px-4 text-sm font-medium text-[var(--foreground,#564739)] hover:bg-[var(--surface,#f5f1ec)]"
            >
              باز کردن در تب جدید
            </a>
            <Link
              href={`/orders/${item.orderId}`}
              className="inline-flex h-10 items-center rounded-[var(--radius-lg,0.75rem)] px-4 text-sm font-medium text-[var(--foreground,#564739)] hover:bg-[var(--surface,#f5f1ec)]"
            >
              جزئیات سفارش
            </Link>
          </div>

          {canReview ? (
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-sm font-medium text-amber-900">بررسی فیش</p>
              <div>
                <Label htmlFor="reject-reason">دلیل رد (در صورت رد)</Label>
                <textarea
                  id="reject-reason"
                  className="mt-1 min-h-[72px] w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm"
                  value={rejectReason}
                  onChange={(e) => onRejectReasonChange(e.target.value)}
                  placeholder="مثلاً: مبلغ با سفارش مطابقت ندارد"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={isApproving} onClick={onApprove}>
                  {isApproving ? 'در حال تأیید…' : 'تأیید فیش'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRejecting}
                  onClick={onReject}
                >
                  {isRejecting ? 'در حال رد…' : 'رد فیش'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
