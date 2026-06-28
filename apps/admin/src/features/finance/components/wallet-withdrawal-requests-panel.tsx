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
  approveAdminWalletWithdrawal,
  fetchWalletTransactions,
  rejectAdminWalletWithdrawal,
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

export function WalletWithdrawalRequestsPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [selected, setSelected] = useState<AdminWalletTransaction | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-withdrawal-requests'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-tx'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'wallets'] });
  };

  const requestsQuery = useQuery({
    queryKey: adminQueryKeys.walletWithdrawalRequests(page, status),
    queryFn: () =>
      fetchWalletTransactions({
        page,
        type: 'WITHDRAWAL',
        status: status || undefined,
        hasWithdrawalRequest: true,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (transactionId: string) => approveAdminWalletWithdrawal(transactionId),
    onSuccess: () => {
      setActionMessage('درخواست برداشت تأیید شد و مبلغ از کیف پول کاربر کسر شد.');
      setSelected(null);
      invalidateQueries();
    },
    onError: () => {
      setErrorMessage('تأیید برداشت ناموفق بود. موجودی یا وضعیت درخواست را بررسی کنید.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      rejectAdminWalletWithdrawal(transactionId, reason),
    onSuccess: () => {
      setActionMessage('درخواست برداشت رد شد.');
      setSelected(null);
      invalidateQueries();
    },
    onError: () => {
      setErrorMessage('رد درخواست برداشت ناموفق بود.');
    },
  });

  const handleApprove = (item: AdminWalletTransaction) => {
    const amountLabel = item.withdrawalRequest?.amountToman
      ? `${formatToman(item.withdrawalRequest.amountToman)} تومان`
      : 'مبلغ درخواستی';
    const userLabel = item.user?.fullName ?? 'کاربر';
    const iban = item.withdrawalRequest?.iban ?? '—';
    const confirmed = window.confirm(
      `برداشت ${amountLabel} از کیف پول «${userLabel}» تأیید شود؟\n\nواریز به شبا:\n${iban}`,
    );
    if (!confirmed) {
      return;
    }
    setErrorMessage(null);
    approveMutation.mutate(item.id);
  };

  const handleReject = (item: AdminWalletTransaction) => {
    const reason = window.prompt('دلیل رد درخواست برداشت:');
    if (!reason?.trim()) {
      return;
    }
    setErrorMessage(null);
    rejectMutation.mutate({ transactionId: item.id, reason: reason.trim() });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        درخواست‌های برداشت از کیف پول کاربران. پس از تأیید، مبلغ از موجودی تومانی کسر می‌شود و
        باید به شبای ثبت‌شده واریز گردد.
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
        {requestsQuery.isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : requestsQuery.isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری درخواست‌های برداشت ناموفق بود.</p>
        ) : requestsQuery.data?.items.length === 0 ? (
          <p className="p-6 text-sm text-muted">درخواست برداشتی ثبت نشده است.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>شبا مقصد</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>زمان ثبت</TableHead>
                <TableHead>تأیید</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsQuery.data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.user?.fullName ?? '—'}</TableCell>
                  <TableCell>
                    {item.withdrawalRequest?.amountToman
                      ? `${formatToman(item.withdrawalRequest.amountToman)} تومان`
                      : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">
                    {item.withdrawalRequest?.iban ?? '—'}
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
                    {item.status === 'PENDING' && item.withdrawalRequest?.iban ? (
                      <div className="flex min-w-[220px] flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(item)}
                        >
                          جزئیات
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            approveMutation.isPending && approveMutation.variables === item.id
                          }
                          onClick={() => handleApprove(item)}
                        >
                          {approveMutation.isPending && approveMutation.variables === item.id
                            ? 'در حال تأیید…'
                            : 'تأیید برداشت'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={
                            rejectMutation.isPending &&
                            rejectMutation.variables?.transactionId === item.id
                          }
                          onClick={() => handleReject(item)}
                        >
                          {rejectMutation.isPending &&
                          rejectMutation.variables?.transactionId === item.id
                            ? 'در حال رد…'
                            : 'رد'}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {requestsQuery.data ? (
        <PaginationBar
          page={requestsQuery.data.page}
          total={requestsQuery.data.total}
          limit={requestsQuery.data.limit}
          onPageChange={setPage}
        />
      ) : null}

      {selected?.withdrawalRequest ? (
        <WithdrawalDetailDialog
          item={selected}
          onClose={() => setSelected(null)}
          onApprove={() => handleApprove(selected)}
          onReject={() => handleReject(selected)}
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      ) : null}
    </div>
  );
}

interface WithdrawalDetailDialogProps {
  item: AdminWalletTransaction;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function WithdrawalDetailDialog({
  item,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: WithdrawalDetailDialogProps) {
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
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--card)] shadow-[var(--shadow-dialog)] sm:rounded-[var(--radius-panel)]"
      >
        <div className="flex items-center justify-between border-b border-border bg-[var(--surface)] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">درخواست برداشت</h2>
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
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-muted">کاربر</dt>
              <dd>{item.user?.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">مبلغ</dt>
              <dd>
                {item.withdrawalRequest?.amountToman
                  ? `${formatToman(item.withdrawalRequest.amountToman)} تومان`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted">شبا مقصد</dt>
              <dd className="font-mono text-xs" dir="ltr">
                {item.withdrawalRequest?.iban ?? '—'}
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

          {item.withdrawalRequest?.rejectionReason ? (
            <p className="rounded-[var(--radius-xl)] border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
              دلیل رد: {item.withdrawalRequest.rejectionReason}
            </p>
          ) : null}

          {canReview ? (
            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--warning-border)] bg-[var(--warning-bg)]/60 p-4">
              <p className="text-sm font-medium text-[var(--secondary)]">
                پس از واریز دستی به شبای بالا، برداشت را تأیید کنید تا مبلغ از کیف پول کسر شود.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={isApproving} onClick={onApprove}>
                  {isApproving ? 'در حال تأیید…' : 'تأیید برداشت'}
                </Button>
                <Button type="button" variant="outline" disabled={isRejecting} onClick={onReject}>
                  {isRejecting ? 'در حال رد…' : 'رد درخواست'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
