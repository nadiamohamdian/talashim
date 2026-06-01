'use client';

import type { ReportBreakdownRow } from '@sadafgold/types';
import { formatToman } from '../lib/format';

interface ReportBreakdownBarsProps {
  title: string;
  rows: ReportBreakdownRow[];
  showAmount?: boolean;
  labelMap?: Record<string, string>;
}

export function ReportBreakdownBars({
  title,
  rows,
  showAmount,
  labelMap,
}: ReportBreakdownBarsProps) {
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="card-luxury p-5">
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="mb-1 flex justify-between text-xs text-stone-600">
              <span>{labelMap?.[row.key] ?? row.label}</span>
              <span>
                {row.count.toLocaleString('fa-IR')}
                {showAmount && row.amount !== undefined ? ` · ${formatToman(row.amount)} ت` : ''}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-nude-100">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${Math.round((row.count / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
