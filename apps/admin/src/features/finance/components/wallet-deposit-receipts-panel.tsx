'use client';

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
import type { AdminWalletTransaction } from '@talashim/types';
import { formatPersianDateTime } from '@/shared/lib/format-date';
import {
  ReceiptPreview,
  downloadReceipt,
  receiptFilenameFromUrl,
} from '@/shared/ui/receipt-preview';
import {
  approveAdminWalletDeposit,
  fetchWalletTransactions,
  rejectAdminWalletDeposit,
} from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { formatToman, selectFieldClass, WALLET_TX_STATUS_FA } from '../lib/labels';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'در انتظار بررسی' },
  { value: 'POSTED', label: 'تأیید شده' },
  { value: 'FAILED', label: 'رد شده' },
  { value: '', label: 'همه' },
];

export function WalletDepositReceiptsPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [selected, setSelected] = useState<AdminWalletTransaction | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const receiptsQuery = useQuery({
    queryKey: adminQueryKeys.walletDepositReceipts(page, status),
    queryFn: () =>
      fetchWalletTransactions({
        page,
        type: 'DEPOSIT',
        status: status || undefined,
        hasReceipt: true,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (transactionId: string) => approveAdminWalletDeposit(transactionId),
    onSuccess: () => {
      setActionMessage('فیش تأیید شد و مبلغ به کیف پول کاربر واریز شد.');
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-deposit-receipts'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-tx'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallets'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      rejectAdminWalletDeposit(transactionId, reason),
    onSuccess: () => {
      setActionMessage('فیش رد شد.');
      setSelected(null);
      setRejectReason('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-deposit-receipts'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-tx'] });
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        فیش‌های واریز کارت‌به‌کارت برای شارژ کیف پول. پس از بررسی فیش، در صورت تأیید مبلغ به
        موجودی ریالی کاربر اضافه می‌شود.
      </p>

      {actionMessage ? (
        <p className="rounded-[var(--radius-xl)] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success)]">
          {actionMessage}
        </p>
      ) : null}

      <FilterBar>
        <div>
          <Label>وضعیت درخواست</Label>
          <select
            className={selectFieldClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {receiptsQuery.isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : receiptsQuery.isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری فیش‌های واریز کیف پول ناموفق بود.</p>
        ) : receiptsQuery.data?.items.length === 0 ? (
          <p className="p-6 text-sm text-muted">فیش واریز کیف پولی ثبت نشده است.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>زمان ثبت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receiptsQuery.data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.user?.fullName ?? '—'}</TableCell>
                  <TableCell>
                    {item.depositRequest?.amountToman
                      ? `${formatToman(item.depositRequest.amountToman)} تومان`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {WALLET_TX_STATUS_FA[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatPersianDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    {item.depositRequest?.receiptUrl ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(item)}
                        >
                          مشاهده فیش
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            downloadReceipt(
                              item.depositRequest!.receiptUrl,
                              receiptFilenameFromUrl(
                                item.depositRequest!.receiptUrl,
                                `wallet-receipt-${item.reference}`,
                              ),
                            )
                          }
                        >
                          دانلود
                        </Button>
                      </div>
                    ) : (
                      '—'
                    )}
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

      {selected?.depositRequest?.receiptUrl ? (
        <WalletDepositReceiptDialog
          item={selected}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
          onClose={() => {
            setSelected(null);
            setRejectReason('');
          }}
          onDownload={() =>
            downloadReceipt(
              selected.depositRequest!.receiptUrl,
              receiptFilenameFromUrl(
                selected.depositRequest!.receiptUrl,
                `wallet-receipt-${selected.reference}`,
              ),
            )
          }
          onApprove={() => approveMutation.mutate(selected.id)}
          onReject={() =>
            rejectMutation.mutate({
              transactionId: selected.id,
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

interface WalletDepositReceiptDialogProps {
  item: AdminWalletTransaction;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function WalletDepositReceiptDialog({
  item,
  rejectReason,
  onRejectReasonChange,
  onClose,
  onDownload,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: WalletDepositReceiptDialogProps) {
  const receiptUrl = item.depositRequest?.receiptUrl ?? '';
  const canReview = item.status === 'PENDING';

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
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--card)] shadow-[var(--shadow-dialog)] sm:rounded-[var(--radius-2xl)]"
      >
        <div className="flex items-center justify-between border-b border-border bg-[var(--surface)] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">فیش واریز کیف پول</h2>
            <p className="mt-1 font-mono text-xs text-muted">{item.reference}</p>
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
              <dt className="text-muted">کاربر</dt>
              <dd>{item.user?.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">مبلغ درخواستی</dt>
              <dd>
                {item.depositRequest?.amountToman
                  ? `${formatToman(item.depositRequest.amountToman)} تومان`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">وضعیت</dt>
              <dd>{WALLET_TX_STATUS_FA[item.status] ?? item.status}</dd>
            </div>
            <div>
              <dt className="text-muted">زمان ثبت</dt>
              <dd>{formatPersianDateTime(item.createdAt)}</dd>
            </div>
          </dl>

          {item.depositRequest?.rejectionReason ? (
            <p className="rounded-[var(--radius-xl)] border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
              دلیل رد: {item.depositRequest.rejectionReason}
            </p>
          ) : null}

          <ReceiptPreview url={receiptUrl} maxHeightClass="max-h-[50vh]" />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onDownload}>
              دانلود فیش
            </Button>
            <a
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-[var(--radius-lg,0.75rem)] px-4 text-sm font-medium text-[var(--foreground,#564739)] hover:bg-[var(--surface,#f5f1ec)]"
            >
              باز کردن در تب جدید
            </a>
          </div>

          {canReview ? (
            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--warning-border)] bg-[var(--warning-bg)]/60 p-4">
              <p className="text-sm font-medium text-[var(--secondary)]">
                بررسی فیش — پس از تأیید، مبلغ به کیف پول کاربر واریز می‌شود
              </p>
              <div>
                <Label htmlFor="wallet-reject-reason">دلیل رد (در صورت رد)</Label>
                <textarea
                  id="wallet-reject-reason"
                  className="mt-1 min-h-[72px] w-full rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm"
                  value={rejectReason}
                  onChange={(e) => onRejectReasonChange(e.target.value)}
                  placeholder="مثلاً: مبلغ واریزی با درخواست مطابقت ندارد"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={isApproving} onClick={onApprove}>
                  {isApproving ? 'در حال تأیید…' : 'تأیید و واریز به کیف پول'}
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
