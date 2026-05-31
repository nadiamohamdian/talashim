'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton } from '@sadafgold/ui';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchAnalytics } from '@/features/admin/api/admin-api';
import { StatCard } from '@/widgets/admin/stat-card';

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-rose-600">بارگذاری آمار داشبورد ناموفق بود</p>;
  }

  const walletChart = data.walletVolumeByType.map((row) => ({
    name: row.type,
    count: row.count,
  }));
  const tradeChart = data.tradesBySide.map((row) => ({
    name: row.side === 'BUY' ? 'خرید' : 'فروش',
    count: row.count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-950 dark:text-zinc-50">داشبورد تحلیلی</h1>
        <p className="mt-1 text-sm text-stone-500">نمای کلی پلتفرم Sadaf Gold</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="کل کاربران" value={data.totalUsers.toLocaleString('fa-IR')} />
        <StatCard label="ادمین‌ها" value={data.adminUsers.toLocaleString('fa-IR')} />
        <StatCard label="KYC در انتظار" value={data.pendingKyc.toLocaleString('fa-IR')} />
        <StatCard
          label="تراکنش ۲۴ساعت"
          value={data.walletTransactions24h.toLocaleString('fa-IR')}
          hint={`${data.goldTrades24h} معامله طلا`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">تراکنش کیف پول (۲۴س)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={walletChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#fbbf24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">معاملات طلا (۲۴س)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
