'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
import {
  approveAdminWalletDeposit,
  fetchWalletTransactions,
  rejectAdminWalletDeposit,
} from '@/features/admin/api/admin-api';
import { formatToman } from '@/features/commerce/lib/labels';
import { fetchPaymentReceipts } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { selectFieldClass } from '../lib/labels';
import {
  RECEIPT_SOURCE_FA,
  type UnifiedReceiptRow,
  type UnifiedReceiptSource,
  mergeUnifiedReceipts,
} from '../lib/unified-receipts';

const PAGE_SIZE = 20;

const SOURCE_OPTIONS: Array<{ value: '' | UnifiedReceiptSource; label: string }> = [
  { value: '', label: 'همه فیش‌ها' },
  { value: 'order', label: 'خرید سفارش' },
  { value: 'wallet', label: 'شارژ کیف پول' },
];

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'RECEIPT_SUBMITTED', label: 'در انتظار بررسی' },
  { value: 'PAID', label: 'تأیید شده' },
  { value: 'AWAITING_RECEIPT', label: 'در انتظار فیش جدید' },
  { value: 'REJECTED', label: 'رد شده' },
];

export function PaymentReceiptsPanel() {
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<'' | UnifiedReceiptSource>('');
  const [orderStatus, setOrderStatus] = useState('');
  const [walletStatus, setWalletStatus] = useState('');
  const [selected, setSelected] = useState<UnifiedReceiptRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const fetchOrders = sourceFilter !== 'wallet';
  const fetchWallets = sourceFilter !== 'order';

  const ordersQuery = useQuery({
    queryKey: adminQueryKeys.paymentReceipts(1, orderStatus),
    queryFn: () =>
      fetchPaymentReceipts({
        page: 1,
        limit: 100,
        status: orderStatus || undefined,
      }),
    enabled: fetchOrders,
  });

  const walletsQuery = useQuery({
    queryKey: adminQueryKeys.walletDepositReceipts(1, walletStatus),
    queryFn: () =>
      fetchWalletTransactions({
        page: 1,
        type: 'DEPOSIT',
        status: walletStatus || undefined,
        hasReceipt: true,
      }),
    enabled: fetchWallets,
  });

  const mergedRows = useMemo(() => {
    const orders = fetchOrders ? (ordersQuery.data?.items ?? []) : [];
    const wallets = fetchWallets ? (walletsQuery.data?.items ?? []) : [];
    return mergeUnifiedReceipts(orders, wallets, sourceFilter);
  }, [fetchOrders, fetchWallets, ordersQuery.data?.items, walletsQuery.data?.items, sourceFilter]);

  const total = mergedRows.length;
  const pageRows = mergedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'payment-receipts'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-deposit-receipts'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-tx'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'wallets'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'orders'] });
  };

  const approveOrderMutation = useMutation({
    mutationFn: ({ orderId, paymentId }: { orderId: string; paymentId: string }) =>
      approveAdminPaymentReceipt(orderId, paymentId),
    onSuccess: () => {
      setActionMessage('فیش سفارش تأیید شد.');
      setSelected(null);
      invalidateAll();
    },
    onError: () => setErrorMessage('تأیید فیش سفارش ناموفق بود.'),
  });

  const rejectOrderMutation = useMutation({
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
      setActionMessage('فیش سفارش رد شد.');
      setSelected(null);
      setRejectReason('');
      invalidateAll();
    },
    onError: () => setErrorMessage('رد فیش سفارش ناموفق بود.'),
  });

  const approveWalletMutation = useMutation({
    mutationFn: (transactionId: string) => approveAdminWalletDeposit(transactionId),
    onSuccess: () => {
      setActionMessage('فیش شارژ کیف پول تأیید شد و موجودی کاربر افزایش یافت.');
      setSelected(null);
      invalidateAll();
    },
    onError: () => setErrorMessage('تأیید فیش کیف پول ناموفق بود.'),
  });

  const rejectWalletMutation = useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      rejectAdminWalletDeposit(transactionId, reason),
    onSuccess: () => {
      setActionMessage('فیش شارژ کیف پول رد شد.');
      setSelected(null);
      setRejectReason('');
      invalidateAll();
    },
    onError: () => setErrorMessage('رد فیش کیف پول ناموفق بود.'),
  });

  const isLoading =
    (fetchOrders && ordersQuery.isLoading) || (fetchWallets && walletsQuery.isLoading);
  const isError = (fetchOrders && ordersQuery.isError) || (fetchWallets && walletsQuery.isError);

  const handleApprove = (row: UnifiedReceiptRow) => {
    const amountLabel = `${formatToman(row.amountToman)} تومان`;
    const typeLabel = RECEIPT_SOURCE_FA[row.source];
    const confirmed = window.confirm(
      `فیش «${typeLabel}» به مبلغ ${amountLabel} برای «${row.userName}» تأیید شود؟`,
    );
    if (!confirmed) {
      return;
    }
    setErrorMessage(null);
    if (row.source === 'order' && row.orderId && row.paymentId) {
      approveOrderMutation.mutate({ orderId: row.orderId, paymentId: row.paymentId });
    } else if (row.transactionId) {
      approveWalletMutation.mutate(row.transactionId);
    }
  };

  const handleReject = (row: UnifiedReceiptRow) => {
    const reason = window.prompt('دلیل رد فیش:');
    if (!reason?.trim()) {
      return;
    }
    setErrorMessage(null);
    if (row.source === 'order' && row.orderId && row.paymentId) {
      rejectOrderMutation.mutate({
        orderId: row.orderId,
        paymentId: row.paymentId,
        reason: reason.trim(),
      });
    } else if (row.transactionId) {
      rejectWalletMutation.mutate({ transactionId: row.transactionId, reason: reason.trim() });
    }
  };

  const isActionPending =
    approveOrderMutation.isPending ||
    rejectOrderMutation.isPending ||
    approveWalletMutation.isPending ||
    rejectWalletMutation.isPending;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        همه فیش‌های کارت‌به‌کارت — هم برای خرید سفارش و هم برای شارژ کیف پول. نوع هر فیش در
        ستون «هدف» مشخص است.
      </p>

      {actionMessage ? (
        <p className="rounded-[var(--radius-xl)] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success)]">
          {actionMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-[var(--radius-xl)] border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
          {errorMessage}
        </p>
      ) : null}

      <FilterBar>
        <div>
          <Label>هدف فیش</Label>
          <select
            className={selectFieldClass}
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value as '' | UnifiedReceiptSource);
              setPage(1);
            }}
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {fetchOrders ? (
          <div>
            <Label>وضعیت سفارش</Label>
            <select
              className={selectFieldClass}
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {fetchWallets ? (
          <div>
            <Label>وضعیت کیف پول</Label>
            <select
              className={selectFieldClass}
              value={walletStatus}
              onChange={(e) => {
                setWalletStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="PENDING">در انتظار بررسی</option>
              <option value="POSTED">تأیید شده</option>
              <option value="FAILED">رد شده</option>
              <option value="">همه</option>
            </select>
          </div>
        ) : null}
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری فیش‌ها ناموفق بود.</p>
        ) : pageRows.length === 0 ? (
          <p className="p-6 text-sm text-muted">فیشی ثبت نشده است.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>هدف</TableHead>
                <TableHead>مرجع</TableHead>
                <TableHead>مشتری</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>زمان ارسال</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>
                    <Badge variant={row.source === 'wallet' ? 'info' : 'gold'}>
                      {RECEIPT_SOURCE_FA[row.source]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.referenceHref ? (
                      <Link
                        href={row.referenceHref}
                        className="font-mono text-xs text-[var(--warning)] underline"
                      >
                        {row.referenceLabel}
                      </Link>
                    ) : (
                      <span className="font-mono text-xs">{row.referenceLabel}</span>
                    )}
                  </TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{formatToman(row.amountToman)} تومان</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.uploadedAt ? formatPersianDateTime(row.uploadedAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(row)}
                      >
                        مشاهده فیش
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          downloadReceipt(
                            row.receiptUrl,
                            receiptFilenameFromUrl(row.receiptUrl, `receipt-${row.referenceLabel}`),
                          )
                        }
                      >
                        دانلود
                      </Button>
                      {row.canReview ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isActionPending}
                            onClick={() => handleApprove(row)}
                          >
                            تأیید
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isActionPending}
                            onClick={() => handleReject(row)}
                          >
                            رد
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {total > 0 ? (
        <PaginationBar
          page={page}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      {selected ? (
        <UnifiedReceiptDialog
          row={selected}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          onClose={() => {
            setSelected(null);
            setRejectReason('');
          }}
          onDownload={() =>
            downloadReceipt(
              selected.receiptUrl,
              receiptFilenameFromUrl(selected.receiptUrl, `receipt-${selected.referenceLabel}`),
            )
          }
          onApprove={() => handleApprove(selected)}
          onReject={() => {
            if (!rejectReason.trim()) {
              setErrorMessage('برای رد فیش، دلیل را وارد کنید.');
              return;
            }
            setErrorMessage(null);
            if (selected.source === 'order' && selected.orderId && selected.paymentId) {
              rejectOrderMutation.mutate({
                orderId: selected.orderId,
                paymentId: selected.paymentId,
                reason: rejectReason.trim(),
              });
            } else if (selected.transactionId) {
              rejectWalletMutation.mutate({
                transactionId: selected.transactionId,
                reason: rejectReason.trim(),
              });
            }
          }}
          isApproving={approveOrderMutation.isPending || approveWalletMutation.isPending}
          isRejecting={rejectOrderMutation.isPending || rejectWalletMutation.isPending}
        />
      ) : null}
    </div>
  );
}

interface UnifiedReceiptDialogProps {
  row: UnifiedReceiptRow;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function UnifiedReceiptDialog({
  row,
  rejectReason,
  onRejectReasonChange,
  onClose,
  onDownload,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: UnifiedReceiptDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--secondary)]/50 backdrop-blur-sm"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--card)] shadow-[var(--shadow-dialog)] sm:rounded-[var(--radius-panel)]"
      >
        <div className="flex items-center justify-between border-b border-border bg-[var(--surface)] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">فیش واریز</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={row.source === 'wallet' ? 'info' : 'gold'}>
                {RECEIPT_SOURCE_FA[row.source]}
              </Badge>
              <span className="font-mono text-xs text-muted">{row.referenceLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
          >
            بستن
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">مشتری</dt>
              <dd>{row.userName}</dd>
            </div>
            <div>
              <dt className="text-muted">مبلغ</dt>
              <dd>{formatToman(row.amountToman)} تومان</dd>
            </div>
            <div>
              <dt className="text-muted">وضعیت</dt>
              <dd>{row.statusLabel}</dd>
            </div>
            <div>
              <dt className="text-muted">زمان ارسال</dt>
              <dd>{row.uploadedAt ? formatPersianDateTime(row.uploadedAt) : '—'}</dd>
            </div>
          </dl>

          {row.rejectionReason ? (
            <p className="rounded-[var(--radius-xl)] border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
              دلیل رد: {row.rejectionReason}
            </p>
          ) : null}

          <ReceiptPreview url={row.receiptUrl} maxHeightClass="max-h-[50vh]" />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onDownload}>
              دانلود فیش
            </Button>
            <a
              href={row.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-[var(--radius-lg,0.75rem)] px-4 text-sm font-medium text-[var(--foreground,#3d3630)] hover:bg-[var(--surface,#fffbf7)]"
            >
              باز کردن در تب جدید
            </a>
            {row.source === 'order' && row.referenceHref ? (
              <Link
                href={row.referenceHref}
                className="inline-flex h-10 items-center rounded-[var(--radius-lg,0.75rem)] px-4 text-sm font-medium text-[var(--foreground,#3d3630)] hover:bg-[var(--surface,#fffbf7)]"
              >
                جزئیات سفارش
              </Link>
            ) : null}
          </div>

          {row.canReview ? (
            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--warning-border)] bg-[var(--warning-bg)]/60 p-4">
              <p className="text-sm font-medium text-[var(--secondary)]">
                {row.source === 'wallet'
                  ? 'پس از تأیید، مبلغ به کیف پول کاربر واریز می‌شود.'
                  : 'پس از تأیید، سفارش نهایی می‌شود.'}
              </p>
              <div>
                <Label htmlFor="reject-reason">دلیل رد (در صورت رد)</Label>
                <textarea
                  id="reject-reason"
                  className="mt-1 min-h-[72px] w-full rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm"
                  value={rejectReason}
                  onChange={(e) => onRejectReasonChange(e.target.value)}
                  placeholder="مثلاً: مبلغ با درخواست مطابقت ندارد"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={isApproving} onClick={onApprove}>
                  {isApproving ? 'در حال تأیید…' : 'تأیید فیش'}
                </Button>
                <Button type="button" variant="outline" disabled={isRejecting} onClick={onReject}>
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
