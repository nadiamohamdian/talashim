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
} from '@sadafgold/ui';
import type { GoldPriceOverrideDto } from '@sadafgold/types';
import {
  createPriceOverride,
  deletePriceOverride,
  fetchPriceOverrides,
  updatePriceOverride,
  type UpsertPriceOverridePayload,
} from '../api/pricing-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { PricingPageShell } from './pricing-page-shell';
import { formatRial } from '../lib/labels';

const emptyForm = (): UpsertPriceOverridePayload => ({
  symbol: 'XAU-IRR',
  karat: 18,
  pricePerGram: 0,
  isActive: true,
});

export function OverridesPanel() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<GoldPriceOverrideDto | null | 'new'>(null);
  const [form, setForm] = useState<UpsertPriceOverridePayload>(emptyForm());
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
        expiresAt: editing.expiresAt?.slice(0, 16),
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
      const payload = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      };
      if (editing && editing !== 'new') {
        return updatePriceOverride(editing.id, payload);
      }
      return createPriceOverride(payload);
    },
    onSuccess: () => {
      setEditing(null);
      invalidate();
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
        <Button type="button" onClick={() => setEditing('new')}>
          بازنویسی جدید
        </Button>
      }
    >
      {editing ? (
        <Card className="space-y-4 border-border bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>قیمت هر گرم (ریال)</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.pricePerGram || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pricePerGram: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label>عیار</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.karat ?? 18}
                onChange={(e) => setForm((f) => ({ ...f, karat: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label>قیمت خرید (اختیاری)</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.buyPrice ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    buyPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div>
              <Label>قیمت فروش (اختیاری)</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.sellPrice ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sellPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>دلیل</Label>
              <Input
                className="mt-1"
                value={form.reason ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
            <div>
              <Label>انقضا</Label>
              <Input
                className="mt-1"
                type="datetime-local"
                value={form.expiresAt ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
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
          <div className="flex gap-2">
            <Button disabled={save.isPending || !form.pricePerGram} onClick={() => save.mutate()}>
              ذخیره
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              انصراف
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری بازنویسی‌ها ناموفق بود.</p>
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
                    {row.expiresAt ? new Date(row.expiresAt).toLocaleString('fa-IR') : 'بدون انقضا'}
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
                        className="h-8 px-3 text-xs text-rose-600"
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
