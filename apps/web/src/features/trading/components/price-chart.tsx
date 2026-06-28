'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { formatPersianTime } from '@/shared/lib/persian-date';
import { useGoldPriceHistory } from '../hooks/use-gold-price-history';

export function PriceChart() {
  const { data, isLoading, isError } = useGoldPriceHistory();

  const chartData = (data ?? [])
    .slice()
    .reverse()
    .map((point) => ({
      time: formatPersianTime(point.recordedAt),
      price: Number(point.pricePerGram),
    }));

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
        نمودار قیمت (۲۴ ساعت اخیر)
      </h2>
      <div className="mt-4 h-64 w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : isError || chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            داده‌ای برای نمودار موجود نیست
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#a1a1aa"
                tickFormatter={(v: number) => formatPrice(v)}
                width={72}
              />
              <Tooltip
                formatter={(value) => [formatPrice(Number(value)), 'قیمت']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#fbbf24"
                strokeWidth={2}
                fill="url(#goldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
