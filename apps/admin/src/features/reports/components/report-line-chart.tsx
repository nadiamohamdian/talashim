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

const CHART_PRIMARY = '#c4a265';
const CHART_SECONDARY = '#3d3630';
const CHART_GRID = '#ebe3da';
const CHART_MUTED = '#8a7f75';

const tooltipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '0.75rem',
  fontSize: '0.8125rem',
  boxShadow: 'var(--shadow-soft)',
  color: 'var(--foreground)',
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
