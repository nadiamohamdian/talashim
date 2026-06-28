'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

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
import type { GoldPriceOverrideDto } from '@talashim/types';
import {
  createPriceOverride,
  deletePriceOverride,
  fetchPriceOverrides,
  updatePriceOverride,
  type UpsertPriceOverridePayload,
} from '../api/pricing-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { PricingPageShell } from './pricing-page-shell';
import { formatRial } from '../lib/labels';
import { FormattedNumberInput } from '@/shared/ui/formatted-number-input';
import { PersianDateTimePicker } from '@/shared/ui/persian-datetime-picker';

const emptyForm = (): UpsertPriceOverridePayload => ({
  symbol: 'XAU-IRR',
  karat: 18,
  pricePerGram: 0,
  isActive: true,
});

function buildOverridePayload(form: UpsertPriceOverridePayload): UpsertPriceOverridePayload {
  const reason = form.reason?.trim();
  return {
    symbol: form.symbol ?? 'XAU-IRR',
    karat: form.karat ?? 18,
    pricePerGram: form.pricePerGram,
    ...(form.buyPrice ? { buyPrice: form.buyPrice } : {}),
    ...(form.sellPrice ? { sellPrice: form.sellPrice } : {}),
    ...(reason ? { reason } : {}),
    isActive: form.isActive ?? true,
    ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
  };
}

export function OverridesPanel() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<GoldPriceOverrideDto | null | 'new'>(null);
  const [form, setForm] = useState<UpsertPriceOverridePayload>(emptyForm());
  const [saveError, setSaveError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.pricing.overrides(page),
    queryFn: () => fetchPriceOverrides({ page }),
  });

  useEffect(() => {
    if (editing && editing !== 'new') {
      setForm({
        symbol: editing.symbol,
        karat: editing.karat,
        pricePerGram: Number(editing.pricePerGram),
        buyPrice: editing.buyPrice ? Number(editing.buyPrice) : undefined,
        sellPrice: editing.sellPrice ? Number(editing.sellPrice) : undefined,
        reason: editing.reason ?? undefined,
        isActive: editing.isActive,
        expiresAt: editing.expiresAt ?? undefined,
      });
    } else if (editing === 'new') {
      setForm(emptyForm());
    }
  }, [editing]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'pricing', 'overrides'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'pricing', 'live'] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = buildOverridePayload(form);
      if (editing && editing !== 'new') {
        return updatePriceOverride(editing.id, payload);
      }
      return createPriceOverride(payload);
    },
    onSuccess: () => {
      setSaveError(null);
      setEditing(null);
      invalidate();
    },
    onError: (error: unknown) => {
      setSaveError(getApiErrorMessage(error, 'ذخیره بازنویسی قیمت ناموفق بود'));
    },
  });

  const remove = useMutation({
    mutationFn: deletePriceOverride,
    onSuccess: invalidate,
  });

  return (
    <PricingPageShell
      routeId="pricing.overrides"
      actions={
        <Button type="button" onClick={() => { setEditing('new'); setSaveError(null); }}>
          بازنویسی جدید
        </Button>
      }
    >
      {editing ? (
        <Card className="space-y-4 border-[var(--border-subtle)] bg-[var(--card)] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormattedNumberInput
              label="قیمت هر گرم (تومان)"
              value={form.pricePerGram > 0 ? String(form.pricePerGram) : ''}
              onChange={(raw) =>
                setForm((f) => ({ ...f, pricePerGram: raw ? Number(raw) : 0 }))
              }
              suffix="تومان"
            />
            <div>
              <Label>عیار</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.karat ?? 18}
                onChange={(e) => setForm((f) => ({ ...f, karat: Number(e.target.value) }))}
              />
            </div>
            <FormattedNumberInput
              label="قیمت خرید (اختیاری)"
              value={form.buyPrice != null ? String(form.buyPrice) : ''}
              onChange={(raw) =>
                setForm((f) => ({
                  ...f,
                  buyPrice: raw ? Number(raw) : undefined,
                }))
              }
              suffix="تومان"
            />
            <FormattedNumberInput
              label="قیمت فروش (اختیاری)"
              value={form.sellPrice != null ? String(form.sellPrice) : ''}
              onChange={(raw) =>
                setForm((f) => ({
                  ...f,
                  sellPrice: raw ? Number(raw) : undefined,
                }))
              }
              suffix="تومان"
            />
            <div className="md:col-span-2">
              <Label>دلیل</Label>
              <Input
                className="mt-1"
                value={form.reason ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
            <div>
              <PersianDateTimePicker
                label="انقضا"
                value={form.expiresAt ?? ''}
                onChange={(expiresAt) => setForm((f) => ({ ...f, expiresAt }))}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                id="override-active"
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              <Label htmlFor="override-active">فعال</Label>
            </div>
          </div>
          {saveError ? (
            <p className="text-sm text-[var(--error)]">{saveError}</p>
          ) : null}
          <div className="flex gap-2">
            <Button disabled={save.isPending || !form.pricePerGram} onClick={() => save.mutate()}>
              ذخیره
            </Button>
            <Button variant="outline" onClick={() => { setEditing(null); setSaveError(null); }}>
              انصراف
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری بازنویسی‌ها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عیار</TableHead>
                <TableHead>قیمت</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>انقضا</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.karat} عیار</TableCell>
                  <TableCell>{formatRial(row.pricePerGram)}</TableCell>
                  <TableCell>{row.isActive ? 'فعال' : 'غیرفعال'}</TableCell>
                  <TableCell className="text-xs">
                    {row.expiresAt
                      ? formatPersianDateTime(row.expiresAt)
                      : 'بدون انقضا'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        className="h-8 px-3 text-xs"
                        variant="outline"
                        onClick={() => setEditing(row)}
                      >
                        ویرایش
                      </Button>
                      <Button
                        className="h-8 px-3 text-xs text-[var(--error)]"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('حذف این بازنویسی؟')) {
                            remove.mutate(row.id);
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
    </PricingPageShell>
  );
}
