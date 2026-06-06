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

const CHART_PRIMARY = '#cba670';
const CHART_SECONDARY = '#564739';
const CHART_GRID = '#e3e3e3';
const CHART_MUTED = '#8a8078';

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #d9d0c8',
  borderRadius: '0.75rem',
  fontSize: '0.8125rem',
  boxShadow: '0 2px 8px rgba(86, 71, 57, 0.08)',
};

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
      <h2 className="text-h3 text-base">{title}</h2>
      <div className="mt-4 h-56 w-full">
        {chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted">
            داده‌ای در بازه نیست.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                name={valueLabel}
                stroke={CHART_PRIMARY}
                strokeWidth={2}
                dot={false}
              />
              {secondaryLabel ? (
                <Line
                  type="monotone"
                  dataKey="secondary"
                  name={secondaryLabel}
                  stroke={CHART_SECONDARY}
                  strokeWidth={2}
                  strokeOpacity={0.5}
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
