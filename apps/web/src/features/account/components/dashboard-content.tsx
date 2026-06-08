'use client';

import { Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useDashboard } from '@/lib/api/hooks/use-dashboard';

export function DashboardContent() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری پیشخوان ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'سفارش‌های فعال', value: data.activeOrders.toLocaleString('fa-IR') },
    { label: 'کل سفارش‌ها', value: data.totalOrders.toLocaleString('fa-IR') },
    {
      label: 'موجودی تومانی',
      value: `${formatPrice(Number(data.rialBalance))} تومان`,
    },
    {
      label: 'موجودی طلا',
      value: `${Number(data.goldBalanceGram).toLocaleString('fa-IR', { maximumFractionDigits: 4 })} گرم`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-luxury p-5">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-2 text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="card-luxury p-5 text-sm text-muted">
        وضعیت احراز هویت:{' '}
        <span className="font-medium text-foreground">{data.kycStatus}</span>
      </div>
    </div>
  );
}
