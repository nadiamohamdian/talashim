'use client';

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
import type { AdminWalletRow } from '@talashim/types';
import { adjustUserWallet, fetchWallets } from '../api/finance-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { useAdminPermission } from '@/features/auth/hooks/use-admin-permission';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { FinancePageShell } from './finance-page-shell';
import { formatToman } from '../lib/labels';

const selectFieldClass =
  'h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm';

type AdjustFormState = {
  assetType: 'RIAL' | 'GOLD';
  direction: 'CREDIT' | 'DEBIT';
  amount: string;
  reason: string;
};

const emptyAdjustForm = (): AdjustFormState => ({
  assetType: 'RIAL',
  direction: 'CREDIT',
  amount: '',
  reason: '',
});

export function WalletsPanel() {
  const canAdjust = useAdminPermission(ADMIN_PERMISSIONS.finance.adjust);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedWallet, setSelectedWallet] = useState<AdminWalletRow | null>(null);
  const [adjustForm, setAdjustForm] = useState<AdjustFormState>(emptyAdjustForm);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.wallets(page, search),
    queryFn: () => fetchWallets({ search: search || undefined, page }),
  });

  const adjustMutation = useMutation({
    mutationFn: adjustUserWallet,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallets'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'wallet-tx'] });
      setSelectedWallet(null);
      setAdjustForm(emptyAdjustForm());
      setAdjustError(null);
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string | string[] } } }).response?.data
              ?.message
          : null;
      setAdjustError(
        Array.isArray(message) ? message.join('، ') : message ?? 'ثبت تغییر کیف پول ناموفق بود.',
      );
    },
  });

  const openAdjustDialog = (row: AdminWalletRow) => {
    setSelectedWallet(row);
    setAdjustForm(emptyAdjustForm());
    setAdjustError(null);
  };

  const submitAdjust = () => {
    if (!selectedWallet) {
      return;
    }
    const amount = adjustForm.amount.trim();
    const reason = adjustForm.reason.trim();
    if (!amount || !reason) {
      setAdjustError('مبلغ و دلیل الزامی است.');
      return;
    }
    adjustMutation.mutate({
      userId: selectedWallet.user.id,
      assetType: adjustForm.assetType,
      direction: adjustForm.direction,
      amount,
      reason,
    });
  };

  return (
    <FinancePageShell routeId="finance.wallets">
      <FilterBar>
        <div className="min-w-[240px] flex-1">
          <Label>جستجوی کاربر</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ایمیل یا نام"
          />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری کیف پول‌ها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>موجودی تومان</TableHead>
                <TableHead>موجودی طلا (گرم)</TableHead>
                {canAdjust ? <TableHead className="text-left">عملیات</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canAdjust ? 6 : 5} className="py-8 text-center text-muted">
                    کاربری یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((row) => (
                  <TableRow key={row.user.id}>
                    <TableCell className="font-medium">{row.user.fullName}</TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)]">
                      {row.user.email}
                    </TableCell>
                    <TableCell className="text-xs">{row.user.role}</TableCell>
                    <TableCell>{formatToman(row.balances.rialBalance)}</TableCell>
                    <TableCell>{Number(row.balances.goldBalanceGram).toFixed(4)}</TableCell>
                    {canAdjust ? (
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openAdjustDialog(row)}>
                          شارژ / برداشت
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
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

      {selectedWallet && canAdjust ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg border-[var(--border-subtle)] bg-[var(--card)] p-4">
            <h3 className="text-base font-semibold text-[var(--foreground)]">تنظیم کیف پول</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {selectedWallet.user.fullName} — {selectedWallet.user.email}
            </p>
            <p className="mt-2 text-sm">
              موجودی فعلی: {formatToman(selectedWallet.balances.rialBalance)} تومان ·{' '}
              {Number(selectedWallet.balances.goldBalanceGram).toFixed(4)} گرم طلا
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label>نوع دارایی</Label>
                <select
                  className={`${selectFieldClass} mt-1`}
                  value={adjustForm.assetType}
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      assetType: e.target.value as 'RIAL' | 'GOLD',
                    })
                  }
                >
                  <option value="RIAL">تومان</option>
                  <option value="GOLD">طلا (گرم)</option>
                </select>
              </div>
              <div>
                <Label>نوع عملیات</Label>
                <select
                  className={`${selectFieldClass} mt-1`}
                  value={adjustForm.direction}
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      direction: e.target.value as 'CREDIT' | 'DEBIT',
                    })
                  }
                >
                  <option value="CREDIT">شارژ (افزایش موجودی)</option>
                  <option value="DEBIT">برداشت (کاهش موجودی)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>{adjustForm.assetType === 'RIAL' ? 'مبلغ (تومان)' : 'مقدار (گرم)'}</Label>
                <Input
                  className="mt-1"
                  dir="ltr"
                  inputMode="decimal"
                  placeholder={adjustForm.assetType === 'RIAL' ? '1000000' : '0.500000'}
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>دلیل (برای لاگ ممیزی)</Label>
                <textarea
                  className={`${selectFieldClass} mt-1 min-h-[88px] py-2`}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="مثلاً: اصلاح خطای واریز / جبران خسارت"
                />
              </div>
            </div>

            {adjustError ? (
              <p className="mt-3 text-sm text-[var(--error)]">{adjustError}</p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedWallet(null);
                  setAdjustError(null);
                }}
              >
                انصراف
              </Button>
              <Button type="button" disabled={adjustMutation.isPending} onClick={submitAdjust}>
                {adjustMutation.isPending ? 'در حال ثبت…' : 'ثبت تغییر'}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </FinancePageShell>
  );
}
