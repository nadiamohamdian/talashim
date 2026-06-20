'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminCouponDto } from '@/features/admin/model/types';
import {
  createCoupon,
  duplicateCoupon,
  fetchCoupons,
  toggleCoupon,
} from '@/features/admin/api/admin-api';
import { CommercePageShell } from './commerce-page-shell';

const INITIAL_FORM = {
  code: '',
  title: '',
  discountType: 'PERCENT' as 'PERCENT' | 'FIXED_AMOUNT',
  discountValue: 0,
  minimumOrderAmount: 0,
  maximumDiscountAmount: 0,
  usageLimitTotal: 0,
  usageLimitPerUser: 0,
  isFirstPurchaseOnly: false,
};

export function CouponsPanel() {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const qc = useQueryClient();

  const couponsQuery = useQuery({
    queryKey: ['admin-coupons', search],
    queryFn: () => fetchCoupons({ page: 1, limit: 50, search }),
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createCoupon({
        ...form,
        code: form.code.toUpperCase().trim(),
        title: form.title.trim(),
        minimumOrderAmount: form.minimumOrderAmount || undefined,
        maximumDiscountAmount: form.maximumDiscountAmount || undefined,
        usageLimitTotal: form.usageLimitTotal || undefined,
        usageLimitPerUser: form.usageLimitPerUser || undefined,
      }),
    onSuccess: () => {
      setForm(INITIAL_FORM);
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCoupon(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const rows = useMemo(() => couponsQuery.data?.items ?? [], [couponsQuery.data?.items]);

  return (
    <CommercePageShell routeId="coupons.list">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجوی کد یا عنوان"
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="px-2 py-2">کد</th>
                <th className="px-2 py-2">عنوان</th>
                <th className="px-2 py-2">نوع</th>
                <th className="px-2 py-2">مقدار</th>
                <th className="px-2 py-2">وضعیت</th>
                <th className="px-2 py-2">استفاده</th>
                <th className="px-2 py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((coupon: AdminCouponDto) => (
                <tr key={coupon.id} className="border-b border-zinc-100">
                  <td className="px-2 py-2 font-medium">{coupon.code}</td>
                  <td className="px-2 py-2">{coupon.title}</td>
                  <td className="px-2 py-2">{coupon.discountType === 'PERCENT' ? 'درصدی' : 'مبلغ ثابت'}</td>
                  <td className="px-2 py-2">{coupon.discountValue}</td>
                  <td className="px-2 py-2">{coupon.isActive ? 'فعال' : 'غیرفعال'}</td>
                  <td className="px-2 py-2">{coupon.usedCount}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                        onClick={() =>
                          toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })
                        }
                      >
                        {coupon.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                        onClick={() => duplicateMutation.mutate(coupon.id)}
                      >
                        کپی
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-zinc-500">
                    {couponsQuery.isLoading ? 'در حال بارگذاری...' : 'کوپنی یافت نشد'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-4 text-base font-semibold">ایجاد کوپن جدید</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="کد (مثلا GOLD20)"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
          />
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="عنوان"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <select
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.discountType}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                discountType: event.target.value as 'PERCENT' | 'FIXED_AMOUNT',
              }))
            }
          >
            <option value="PERCENT">درصدی</option>
            <option value="FIXED_AMOUNT">مبلغ ثابت</option>
          </select>
          <input
            type="number"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="مقدار تخفیف"
            value={form.discountValue}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, discountValue: Number(event.target.value) }))
            }
          />
        </div>
        <button
          type="button"
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'در حال ذخیره...' : 'ذخیره کوپن'}
        </button>
      </section>
    </CommercePageShell>
  );
}
