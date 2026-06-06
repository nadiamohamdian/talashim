'use client';

import { useMemo, type ReactNode } from 'react';
import { Label } from '@sadafgold/ui';
import {
  daysInJalaaliMonth,
  formatJalaaliDateTime,
  fromJalaali,
  JALAALI_MONTHS_FA,
  toJalaali,
} from '@/shared/lib/jalaali';
import { selectFieldClass } from '@/features/commerce/lib/labels';

interface PersianDateTimePickerProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
}

function parseIso(iso: string): Date | null {
  if (!iso.trim()) {
    return null;
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function SelectField({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold text-stone-500">{title}</span>
      {children}
    </label>
  );
}

export function PersianDateTimePicker({ label, value, onChange }: PersianDateTimePickerProps) {
  const current = useMemo(() => parseIso(value) ?? new Date(), [value]);
  const j = toJalaali(current);

  const emit = (patch: Partial<typeof j>) => {
    const next = { ...j, ...patch };
    const maxDay = daysInJalaaliMonth(next.jy, next.jm);
    if (next.jd > maxDay) {
      next.jd = maxDay;
    }
    const date = fromJalaali(next.jy, next.jm, next.jd, next.hour, next.minute);
    onChange(date.toISOString());
  };

  const years = useMemo(() => {
    const now = toJalaali(new Date()).jy;
    return Array.from({ length: 11 }, (_, i) => now - 5 + i);
  }, []);

  const days = useMemo(
    () => Array.from({ length: daysInJalaaliMonth(j.jy, j.jm) }, (_, i) => i + 1),
    [j.jy, j.jm],
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

  const selectClass = `${selectFieldClass} mt-0 min-w-0`;

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-nude-50/90 to-white shadow-sm">
        <div className="border-b border-border bg-white/70 px-4 py-3">
          <p className="text-xs text-stone-500">تاریخ و ساعت انتخاب‌شده</p>
          <p className="mt-1 text-sm font-bold text-stone-900">
            {value ? formatJalaaliDateTime(current) : 'هنوز انتخاب نشده'}
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField title="سال">
            <select className={selectClass} value={j.jy} onChange={(e) => emit({ jy: Number(e.target.value) })}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year.toLocaleString('fa-IR')}
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
                  {day.toLocaleString('fa-IR')}
                </option>
              ))}
            </select>
          </SelectField>

          <SelectField title="ساعت">
            <select
              className={selectClass}
              value={j.hour}
              onChange={(e) => emit({ hour: Number(e.target.value) })}
            >
              {hours.map((hour) => (
                <option key={hour} value={hour}>
                  {hour.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}
                </option>
              ))}
            </select>
          </SelectField>

          <SelectField title="دقیقه">
            <select
              className={selectClass}
              value={j.minute}
              onChange={(e) => emit({ minute: Number(e.target.value) })}
            >
              {minutes.map((minute) => (
                <option key={minute} value={minute}>
                  {minute.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}
                </option>
              ))}
            </select>
          </SelectField>
        </div>

        {value ? (
          <div className="border-t border-border px-4 py-2">
            <button
              type="button"
              className="text-xs font-semibold text-rose-700 hover:underline"
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
