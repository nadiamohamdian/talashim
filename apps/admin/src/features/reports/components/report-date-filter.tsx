'use client';

import { Label } from '@sadafgold/ui';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { fromDateInputValue, toDateInputValue } from '../lib/date-range';

interface ReportDateFilterProps {
  from: string;
  to: string;
  onFromChange: (iso: string) => void;
  onToChange: (iso: string) => void;
  children?: React.ReactNode;
}

export function ReportDateFilter({
  from,
  to,
  onFromChange,
  onToChange,
  children,
}: ReportDateFilterProps) {
  return (
    <FilterBar>
      <div>
        <Label htmlFor="report-from">از تاریخ</Label>
        <input
          id="report-from"
          type="date"
          className="mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm"
          value={toDateInputValue(from)}
          onChange={(e) => onFromChange(fromDateInputValue(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="report-to">تا تاریخ</Label>
        <input
          id="report-to"
          type="date"
          className="mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm"
          value={toDateInputValue(to)}
          onChange={(e) => onToChange(fromDateInputValue(e.target.value, true))}
        />
      </div>
      {children}
    </FilterBar>
  );
}
