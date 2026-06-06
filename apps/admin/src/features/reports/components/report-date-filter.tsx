'use client';

import { FilterBar } from '@/widgets/admin/filter-bar';
import { PersianDatePicker } from '@/shared/ui/persian-date-picker';
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
      <div className="min-w-[220px]">
        <PersianDatePicker
          label="از تاریخ"
          value={from ? toDateInputValue(from) : ''}
          valueFormat="iso"
          onChange={(value) => onFromChange(value ? fromDateInputValue(value) : '')}
        />
      </div>
      <div className="min-w-[220px]">
        <PersianDatePicker
          label="تا تاریخ"
          value={to ? toDateInputValue(to) : ''}
          valueFormat="iso"
          endOfDay
          onChange={(value) => onToChange(value ? fromDateInputValue(value, true) : '')}
        />
      </div>
      {children}
    </FilterBar>
  );
}
