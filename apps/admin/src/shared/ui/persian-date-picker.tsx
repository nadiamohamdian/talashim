'use client';

import { useMemo, type ReactNode } from 'react';
import { Label } from '@sadafgold/ui';
import {
  daysInJalaaliMonth,
  formatPersianDate,
  fromJalaali,
  JALAALI_MONTHS_FA,
  toJalaali,
} from '@/shared/lib/jalaali';
import { selectFieldClass } from '@/features/commerce/lib/labels';

interface PersianDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** `date` → YYYY-MM-DD, `iso` → full ISO string (start of day) */
  valueFormat?: 'date' | 'iso';
  /** When valueFormat is `iso`, set end of day instead of start */
  endOfDay?: boolean;
}

function parseValue(value: string): Date | null {
  if (!value.trim()) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function emitValue(date: Date, valueFormat: 'date' | 'iso', endOfDay: boolean): string {
  if (valueFormat === 'date') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const copy = new Date(date);
  if (endOfDay) {
    copy.setHours(23, 59, 59, 999);
  } else {
    copy.setHours(0, 0, 0, 0);
  }
  return copy.toISOString();
}

function formatPlainFa(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString('fa-IR', { useGrouping: false, ...options });
}

function SelectField({ title, children }: { title: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold text-muted">{title}</span>
      {children}
    </label>
  );
}

export function PersianDatePicker({
  label,
  value,
  onChange,
  valueFormat = 'date',
  endOfDay = false,
}: PersianDatePickerProps) {
  const current = useMemo(() => parseValue(value) ?? new Date(), [value]);
  const j = toJalaali(current);

  const emit = (patch: Partial<typeof j>) => {
    const next = { ...j, ...patch };
    const maxDay = daysInJalaaliMonth(next.jy, next.jm);
    if (next.jd > maxDay) {
      next.jd = maxDay;
    }
    const date = fromJalaali(next.jy, next.jm, next.jd, 12, 0);
    onChange(emitValue(date, valueFormat, endOfDay));
  };

  const years = useMemo(() => {
    const now = toJalaali(new Date()).jy;
    return Array.from({ length: 11 }, (_, i) => now - 5 + i);
  }, []);

  const days = useMemo(
    () => Array.from({ length: daysInJalaaliMonth(j.jy, j.jm) }, (_, i) => i + 1),
    [j.jy, j.jm],
  );

  const selectClass = `${selectFieldClass} mt-0 min-w-0`;

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-gradient-to-b from-nude-50/90 to-white shadow-sm">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--card)]/70 px-4 py-3">
          <p className="text-xs text-muted">تاریخ انتخاب‌شده</p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {value ? formatPersianDate(current) : 'هنوز انتخاب نشده'}
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <SelectField title="سال">
            <select className={selectClass} value={j.jy} onChange={(e) => emit({ jy: Number(e.target.value) })}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {formatPlainFa(year)}
                </option>
              ))}
            </select>
          </SelectField>

          <SelectField title="ماه">
            <select className={selectClass} value={j.jm} onChange={(e) => emit({ jm: Number(e.target.value) })}>
              {JALAALI_MONTHS_FA.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </SelectField>

          <SelectField title="روز">
            <select className={selectClass} value={j.jd} onChange={(e) => emit({ jd: Number(e.target.value) })}>
              {days.map((day) => (
                <option key={day} value={day}>
                  {formatPlainFa(day)}
                </option>
              ))}
            </select>
          </SelectField>
        </div>

        {value ? (
          <div className="border-t border-border px-4 py-2">
            <button
              type="button"
              className="text-xs font-semibold text-[var(--error)] hover:underline"
              onClick={() => onChange('')}
            >
              پاک کردن تاریخ
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
