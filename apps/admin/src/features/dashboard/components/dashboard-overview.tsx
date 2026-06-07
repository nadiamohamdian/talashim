'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from '@/shared/ui/icons';
import { Card, Skeleton } from '@sadafgold/ui';
import { AdminApiError } from '@/shared/ui/admin-api-error';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAnalytics, fetchAuditLogs, fetchTradeOrders } from '@/features/admin/api/admin-api';
import { fetchAdminLivePrice } from '@/features/pricing/api/pricing-admin-api';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { getSectionIcon } from '@/shared/lib/admin-nav-icons';
import { getSectionTheme } from '@/shared/lib/admin-section-theme';
import { ChartPanel } from '@/widgets/admin/chart-panel';
import { StatCard } from '@/widgets/admin/stat-card';
import { PageHeader } from '@/widgets/admin/page-header';

const CHART_PRIMARY = '#cba670';
const CHART_SUCCESS = '#4a8a72';
const CHART_GRID = 'rgba(86, 71, 57, 0.06)';
const CHART_MUTED = '#7a6e64';

const tooltipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '0.875rem',
  fontSize: '0.8125rem',
  boxShadow: 'var(--shadow-soft)',
  color: 'var(--foreground)',
};

function formatToman(value: string | number) {
  return Number(value).toLocaleString('fa-IR');
}

export function DashboardOverview() {
  const route = ADMIN_ROUTE_BY_ID.dashboard;
  if (!route) {
    return null;
  }

  const DashboardIcon = getSectionIcon(route.sectionId);
  const dashboardTheme = getSectionTheme(route.sectionId);

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
      <div className="admin-page-stack">
        <PageHeader
          title={route.label}
          description="نمای عملیاتی پلتفرم — داده‌ها از API واقعی بارگذاری می‌شوند."
          availability={route.availability}
          icon={DashboardIcon}
          iconTheme={dashboardTheme}
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
          <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
            <AdminApiError
              title="بارگذاری آمار داشبورد ناموفق بود."
              error={analyticsQuery.error}
              onRetry={() => void analyticsQuery.refetch()}
            />
          </Card>
        ) : (
          <>
            <section className="dashboard-hero stagger-children">
              <StatCard
                className="dashboard-kpi-featured"
                variant="featured"
                label="کل کاربران"
                value={data.totalUsers.toLocaleString('fa-IR')}
                animateValue={data.totalUsers}
                hint="رشد کاربران ثبت‌نام‌شده"
                icon={Users}
                accent="violet"
              />
              <StatCard
                variant="featured"
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
                accent="gold"
              />
              <div className="dashboard-kpi-spotlight">
                <div>
                  <p className="dashboard-kpi-spotlight-label">نرخ خرید و فروش زنده</p>
                  {livePriceQuery.data ? (
                    <p className="mt-1 text-caption">
                      اسپرد {livePriceQuery.data.spreadPercent}% ·{' '}
                      {formatPersianDateTime(livePriceQuery.data.recordedAt)}
                    </p>
                  ) : (
                    <p className="mt-1 text-caption">در حال بارگذاری…</p>
                  )}
                </div>
                <div className="dashboard-kpi-spotlight-prices">
                  <div className="dashboard-kpi-spotlight-price">
                    <p className="dashboard-kpi-spotlight-price-label">خرید</p>
                    <p className="dashboard-kpi-spotlight-price-value">
                      {livePriceQuery.data ? formatToman(livePriceQuery.data.buyPrice) : '—'}
                    </p>
                  </div>
                  <div className="dashboard-kpi-spotlight-price">
                    <p className="dashboard-kpi-spotlight-price-label">فروش</p>
                    <p className="dashboard-kpi-spotlight-price-value">
                      {livePriceQuery.data ? formatToman(livePriceQuery.data.sellPrice) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="stagger-children grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="ادمین‌ها"
                value={data.adminUsers.toLocaleString('fa-IR')}
                animateValue={data.adminUsers}
                icon={ShieldCheck}
                accent="emerald"
              />
              <StatCard
                label="KYC در انتظار"
                value={data.pendingKyc.toLocaleString('fa-IR')}
                animateValue={data.pendingKyc}
                icon={Activity}
                accent="amber"
              />
              <StatCard
                label="تراکنش کیف ۲۴س"
                value={data.walletTransactions24h.toLocaleString('fa-IR')}
                animateValue={data.walletTransactions24h}
                icon={Wallet}
                accent="teal"
              />
              <StatCard
                label="معاملات طلا ۲۴س"
                value={data.goldTrades24h.toLocaleString('fa-IR')}
                animateValue={data.goldTrades24h}
                icon={TrendingUp}
                accent="gold"
              />
            </div>

            <div className="admin-grid-tight grid lg:grid-cols-2">
              <ChartPanel
                title="تراکنش کیف پول (۲۴ ساعت)"
                subtitle="حجم تراکنش‌ها بر اساس نوع · GET /admin/analytics"
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.walletVolumeByType.map((row) => ({
                        name: row.type,
                        count: row.count,
                      }))}
                    >
                      <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill={CHART_PRIMARY} radius={[8, 8, 0, 0]} maxBarSize={52} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartPanel>

              <ChartPanel
                title="معاملات طلا (۲۴ ساعت)"
                subtitle="تفکیک خرید و فروش · GET /admin/analytics"
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.tradesBySide.map((row) => ({
                        name: row.side === 'BUY' ? 'خرید' : 'فروش',
                        count: row.count,
                      }))}
                    >
                      <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill={CHART_SUCCESS} radius={[8, 8, 0, 0]} maxBarSize={52} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartPanel>
            </div>

            <div className="admin-grid-tight grid lg:grid-cols-2">
              <section className="list-panel">
                <header className="list-panel-header">
                  <h3 className="list-panel-title">فعالیت‌های اخیر</h3>
                  <Link href="/security/audit" className="link-accent text-xs font-medium">
                    مشاهده همه
                  </Link>
                </header>
                <div className="list-panel-body">
                  {auditQuery.isLoading ? (
                    <Skeleton className="mx-2 h-24 w-auto" />
                  ) : (
                    auditQuery.data?.items.slice(0, 6).map((log) => (
                      <div key={log.id} className="list-panel-item">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{log.action}</p>
                          <p className="text-caption">
                            {log.actor?.fullName ?? 'سیستم'} · {log.source}
                          </p>
                        </div>
                        <time className="shrink-0 text-caption">
                          {formatPersianDateTime(log.createdAt)}
                        </time>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="list-panel">
                <header className="list-panel-header">
                  <h3 className="list-panel-title">آخرین معاملات</h3>
                  <Link href="/trading/history" className="link-accent text-xs font-medium">
                    تاریخچه
                  </Link>
                </header>
                <div className="list-panel-body">
                  {tradesQuery.isLoading ? (
                    <Skeleton className="mx-2 h-24 w-auto" />
                  ) : (
                    tradesQuery.data?.items.slice(0, 6).map((order) => (
                      <div key={order.id} className="list-panel-item">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-muted">{order.orderNumber}</p>
                          <p className="text-sm font-medium text-foreground">
                            {order.user.fullName} · {order.side === 'BUY' ? 'خرید' : 'فروش'}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {Number(order.netRial).toLocaleString('fa-IR')} ریال
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </RoutePermissionGuard>
  );
}
