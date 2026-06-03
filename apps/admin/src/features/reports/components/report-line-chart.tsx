'use client';

import type { ReportChartPoint } from '@talashim/types';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ReportLineChartProps {
  title: string;
  data: ReportChartPoint[];
  valueLabel?: string;
  secondaryLabel?: string;
}

export function ReportLineChart({
  title,
  data,
  valueLabel = 'تعداد',
  secondaryLabel,
}: ReportLineChartProps) {
  const chartData = data.map((point) => ({
    name: point.label.slice(5),
    value: point.value,
    secondary: point.secondaryValue ?? 0,
  }));

  return (
    <div className="card-luxury p-5">
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      <div className="mt-4 h-56 w-full">
        {chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-stone-500">
            داده‌ای در بازه نیست.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                name={valueLabel}
                stroke="#c4a265"
                strokeWidth={2}
                dot={false}
              />
              {secondaryLabel ? (
                <Line
                  type="monotone"
                  dataKey="secondary"
                  name={secondaryLabel}
                  stroke="#78716c"
                  strokeWidth={2}
                  dot={false}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
