'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton } from '@sadafgold/ui';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAnalytics, fetchAuditLogs, fetchTradeOrders } from '@/features/admin/api/admin-api';
import { fetchLiveGoldPrice } from '@/lib/api/pricing.api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { StatCard } from '@/widgets/admin/stat-card';
import { PageHeader } from '@/widgets/admin/page-header';

function formatToman(value: string | number) {
  return Number(value).toLocaleString('fa-IR');
}

export function DashboardOverview() {
  const analyticsQuery = useQuery({
    queryKey: adminQueryKeys.analytics,
    queryFn: fetchAnalytics,
    refetchInterval: 60_000,
  });

  const livePriceQuery = useQuery({
    queryKey: adminQueryKeys.pricingLive('XAU-IRR', 18),
    queryFn: () => fetchLiveGoldPrice({ symbol: 'XAU-IRR', karat: 18 }),
    refetchInterval: 30_000,
  });

  const auditQuery = useQuery({
    queryKey: [...adminQueryKeys.audit(1, ''), 'recent'],
    queryFn: () => fetchAuditLogs({ page: 1 }),
  });

  const tradesQuery = useQuery({
    queryKey: [...adminQueryKeys.trades(1, ''), 'recent'],
    queryFn: () => fetchTradeOrders({ page: 1 }),
  });

  const { data, isLoading, isError } = analyticsQuery;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-rose-400">
        بارگذاری آمار داشبورد ناموفق بود — API و توکن ادمین را بررسی کنید.
      </p>
    );
  }

  const walletChart = data.walletVolumeByType.map((row) => ({
    name: row.type,
    count: row.count,
  }));
  const tradeChart = data.tradesBySide.map((row) => ({
    name: row.side === 'BUY' ? 'خرید' : 'فروش',
    count: row.count,
  }));

  const live = livePriceQuery.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="داشبورد تحلیلی"
        description="نمای عملیاتی پلتفرم — داده‌ها از API واقعی بارگذاری می‌شوند."
        availability="live"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="کل کاربران"
          value={data.totalUsers.toLocaleString('fa-IR')}
          hint="رشد کاربر"
        />
        <StatCard label="ادمین‌ها" value={data.adminUsers.toLocaleString('fa-IR')} />
        <StatCard label="KYC در انتظار" value={data.pendingKyc.toLocaleString('fa-IR')} />
        <StatCard
          label="تراکنش کیف ۲۴س"
          value={data.walletTransactions24h.toLocaleString('fa-IR')}
        />
        <StatCard label="معاملات طلا ۲۴س" value={data.goldTrades24h.toLocaleString('fa-IR')} />
        <StatCard
          label="قیمت هر گرم (۱۸)"
          value={live ? `${formatToman(live.pricePerGram)} ت` : '—'}
          hint={live ? `منبع: ${live.providerName}` : 'در حال بارگذاری…'}
        />
        <StatCard
          label="خرید / فروش زنده"
          value={live ? `${formatToman(live.buyPrice)} / ${formatToman(live.sellPrice)}` : '—'}
          hint={live ? `اسپرد ${live.spreadPercent}%` : undefined}
        />
        <StatCard
          label="به‌روزرسانی قیمت"
          value={live ? new Date(live.recordedAt).toLocaleString('fa-IR') : '—'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="font-semibold text-zinc-100">تراکنش کیف پول (۲۴ ساعت)</h2>
          <p className="mt-1 text-xs text-zinc-500">منبع: GET /admin/analytics</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={walletChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
                <Bar dataKey="count" fill="#c4a265" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="font-semibold text-zinc-100">معاملات طلا (۲۴ ساعت)</h2>
          <p className="mt-1 text-xs text-zinc-500">منبع: GET /admin/analytics</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
                <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">فعالیت‌های اخیر</h2>
            <Link href="/security/audit" className="text-xs text-amber-400 hover:underline">
              مشاهده همه
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {auditQuery.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              auditQuery.data?.items.slice(0, 6).map((log) => (
                <li
                  key={log.id}
                  className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2 text-sm last:border-0"
                >
                  <div>
                    <p className="text-zinc-200">{log.action}</p>
                    <p className="text-xs text-zinc-500">
                      {log.actor?.fullName ?? 'سیستم'} · {log.source}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-zinc-500">
                    {new Date(log.createdAt).toLocaleString('fa-IR')}
                  </time>
                </li>
              ))
            )}
          </ul>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">آخرین معاملات</h2>
            <Link href="/trading/history" className="text-xs text-amber-400 hover:underline">
              تاریخچه
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {tradesQuery.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              tradesQuery.data?.items.slice(0, 6).map((order) => (
                <li
                  key={order.id}
                  className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2 text-sm last:border-0"
                >
                  <div>
                    <p className="font-mono text-xs text-zinc-400">{order.orderNumber}</p>
                    <p className="text-zinc-200">
                      {order.user.fullName} · {order.side === 'BUY' ? 'خرید' : 'فروش'}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {Number(order.netRial).toLocaleString('fa-IR')} ریال
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
