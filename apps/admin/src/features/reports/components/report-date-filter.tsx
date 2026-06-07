'use client';

import { FilterBar } from '@/widgets/admin/filter-bar';
import { PersianDatePicker } from '@/shared/ui/persian-date-picker';

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
          value={from}
          valueFormat="iso"
          onChange={onFromChange}
        />
      </div>
      <div className="min-w-[220px]">
        <PersianDatePicker
          label="تا تاریخ"
          value={to}
          valueFormat="iso"
          endOfDay
          onChange={onToChange}
        />
      </div>
      {children}
    </FilterBar>
  );
}
