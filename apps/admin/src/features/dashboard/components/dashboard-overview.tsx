'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeftRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from '@/shared/ui/icons';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@sadafgold/ui';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAnalytics, fetchAuditLogs, fetchTradeOrders } from '@/features/admin/api/admin-api';
import { fetchAdminLivePrice } from '@/features/pricing/api/pricing-admin-api';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { StatCard } from '@/widgets/admin/stat-card';
import { PageHeader } from '@/widgets/admin/page-header';

const CHART_PRIMARY = '#cba670';
const CHART_SUCCESS = '#3d7a5f';
const CHART_GRID = '#e3e3e3';
const CHART_MUTED = '#8a8078';

function formatToman(value: string | number) {
  return Number(value).toLocaleString('fa-IR');
}

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #d9d0c8',
  borderRadius: '0.75rem',
  fontSize: '0.8125rem',
  boxShadow: '0 2px 8px rgba(86, 71, 57, 0.08)',
};

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
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          </div>
        ) : isError || !data ? (
          <p className="rounded-[var(--radius-lg)] border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
            بارگذاری آمار داشبورد ناموفق بود — API و توکن ادمین را بررسی کنید.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="کل کاربران"
                value={data.totalUsers.toLocaleString('fa-IR')}
                hint="رشد کاربر"
                icon={Users}
              />
              <StatCard
                label="ادمین‌ها"
                value={data.adminUsers.toLocaleString('fa-IR')}
                icon={ShieldCheck}
              />
              <StatCard
                label="KYC در انتظار"
                value={data.pendingKyc.toLocaleString('fa-IR')}
                icon={Activity}
              />
              <StatCard
                label="تراکنش کیف ۲۴س"
                value={data.walletTransactions24h.toLocaleString('fa-IR')}
                icon={Wallet}
              />
              <StatCard
                label="معاملات طلا ۲۴س"
                value={data.goldTrades24h.toLocaleString('fa-IR')}
                icon={TrendingUp}
              />
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
                icon={TrendingUp}
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
                icon={ArrowLeftRight}
              />
              <StatCard
                label="به‌روزرسانی قیمت"
                value={
                  livePriceQuery.data
                    ? new Date(livePriceQuery.data.recordedAt).toLocaleString('fa-IR')
                    : '—'
                }
                icon={Clock}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>تراکنش کیف پول (۲۴ ساعت)</CardTitle>
                  <p className="text-caption">منبع: GET /admin/analytics</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.walletVolumeByType.map((row) => ({
                          name: row.type,
                          count: row.count,
                        }))}
                      >
                        <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" fill={CHART_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معاملات طلا (۲۴ ساعت)</CardTitle>
                  <p className="text-caption">منبع: GET /admin/analytics</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.tradesBySide.map((row) => ({
                          name: row.side === 'BUY' ? 'خرید' : 'فروش',
                          count: row.count,
                        }))}
                      >
                        <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" fill={CHART_SUCCESS} radius={[6, 6, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>فعالیت‌های اخیر</CardTitle>
                    <Link
                      href="/security/audit"
                      className="text-xs font-medium text-[var(--primary)] transition hover:opacity-80"
                    >
                      مشاهده همه
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {auditQuery.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : (
                      auditQuery.data?.items.slice(0, 6).map((log) => (
                        <li
                          key={log.id}
                          className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] px-2 py-2.5 transition hover:bg-[var(--surface)]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{log.action}</p>
                            <p className="text-caption">
                              {log.actor?.fullName ?? 'سیستم'} · {log.source}
                            </p>
                          </div>
                          <time className="shrink-0 text-caption">
                            {new Date(log.createdAt).toLocaleString('fa-IR')}
                          </time>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>آخرین معاملات</CardTitle>
                    <Link
                      href="/trading/history"
                      className="text-xs font-medium text-[var(--primary)] transition hover:opacity-80"
                    >
                      تاریخچه
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {tradesQuery.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : (
                      tradesQuery.data?.items.slice(0, 6).map((order) => (
                        <li
                          key={order.id}
                          className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] px-2 py-2.5 transition hover:bg-[var(--surface)]"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-xs text-muted">{order.orderNumber}</p>
                            <p className="text-sm text-foreground">
                              {order.user.fullName} · {order.side === 'BUY' ? 'خرید' : 'فروش'}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-medium text-foreground">
                            {Number(order.netRial).toLocaleString('fa-IR')} ریال
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </RoutePermissionGuard>
  );
}
