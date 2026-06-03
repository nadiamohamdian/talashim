'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton } from '@sadafgold/ui';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAnalytics, fetchAuditLogs, fetchTradeOrders } from '@/features/admin/api/admin-api';
import { fetchAdminLivePrice } from '@/features/pricing/api/pricing-admin-api';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { StatCard } from '@/widgets/admin/stat-card';
import { PageHeader } from '@/widgets/admin/page-header';

function formatToman(value: string | number) {
  return Number(value).toLocaleString('fa-IR');
}

export function DashboardOverview() {
  const route = ADMIN_ROUTE_BY_ID.dashboard;
  if (!route) {
    return null;
  }

  const analyticsQuery = useQuery({
    queryKey: adminQueryKeys.analytics,
    queryFn: fetchAnalytics,
    refetchInterval: 60_000,
  });

  const livePriceQuery = useQuery({
    queryKey: adminQueryKeys.pricing.live('XAU-IRR', 18),
    queryFn: () => fetchAdminLivePrice({ symbol: 'XAU-IRR', karat: 18 }),
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

  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="space-y-8">
        <PageHeader
          title={route.label}
          description="نمای عملیاتی پلتفرم — داده‌ها از API واقعی بارگذاری می‌شوند."
          availability={route.availability}
        />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : isError || !data ? (
          <p className="text-rose-600">
            بارگذاری آمار داشبورد ناموفق بود — API و توکن ادمین را بررسی کنید.
          </p>
        ) : (
          <>
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
                value={
                  livePriceQuery.data
                    ? `${formatToman(livePriceQuery.data.pricePerGram)} ت`
                    : '—'
                }
                hint={
                  livePriceQuery.data
                    ? `منبع: ${livePriceQuery.data.providerName}`
                    : 'در حال بارگذاری…'
                }
              />
              <StatCard
                label="خرید / فروش زنده"
                value={
                  livePriceQuery.data
                    ? `${formatToman(livePriceQuery.data.buyPrice)} / ${formatToman(livePriceQuery.data.sellPrice)}`
                    : '—'
                }
                hint={
                  livePriceQuery.data
                    ? `اسپرد ${livePriceQuery.data.spreadPercent}%`
                    : undefined
                }
              />
              <StatCard
                label="به‌روزرسانی قیمت"
                value={
                  livePriceQuery.data
                    ? new Date(livePriceQuery.data.recordedAt).toLocaleString('fa-IR')
                    : '—'
                }
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-white p-6">
                <h2 className="font-semibold text-stone-900">تراکنش کیف پول (۲۴ ساعت)</h2>
                <p className="mt-1 text-xs text-stone-500">منبع: GET /admin/analytics</p>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.walletVolumeByType.map((row) => ({
                        name: row.type,
                        count: row.count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e7e5e4',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#c4a265" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="border-border bg-white p-6">
                <h2 className="font-semibold text-stone-900">معاملات طلا (۲۴ ساعت)</h2>
                <p className="mt-1 text-xs text-stone-500">منبع: GET /admin/analytics</p>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.tradesBySide.map((row) => ({
                        name: row.side === 'BUY' ? 'خرید' : 'فروش',
                        count: row.count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e7e5e4',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-stone-900">فعالیت‌های اخیر</h2>
                  <Link href="/security/audit" className="text-xs text-gold-dark hover:underline">
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
                        className="flex items-start justify-between gap-2 border-b border-border pb-2 text-sm last:border-0"
                      >
                        <div>
                          <p className="text-stone-800">{log.action}</p>
                          <p className="text-xs text-stone-500">
                            {log.actor?.fullName ?? 'سیستم'} · {log.source}
                          </p>
                        </div>
                        <time className="shrink-0 text-xs text-stone-500">
                          {new Date(log.createdAt).toLocaleString('fa-IR')}
                        </time>
                      </li>
                    ))
                  )}
                </ul>
              </Card>
              <Card className="border-border bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-stone-900">آخرین معاملات</h2>
                  <Link href="/trading/history" className="text-xs text-gold-dark hover:underline">
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
                        className="flex items-start justify-between gap-2 border-b border-border pb-2 text-sm last:border-0"
                      >
                        <div>
                          <p className="font-mono text-xs text-stone-500">{order.orderNumber}</p>
                          <p className="text-stone-800">
                            {order.user.fullName} · {order.side === 'BUY' ? 'خرید' : 'فروش'}
                          </p>
                        </div>
                        <span className="text-xs text-stone-600">
                          {Number(order.netRial).toLocaleString('fa-IR')} ریال
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </Card>
            </div>
          </>
        )}
      </div>
    </RoutePermissionGuard>
  );
}
