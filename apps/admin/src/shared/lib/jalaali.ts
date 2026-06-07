/** Persian (Jalali) calendar — Iran astronomical calendar via ICU Intl API. */

const TEHRAN_TZ = 'Asia/Tehran';
const TEHRAN_OFFSET = '+03:30';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function readIntlParts(date: Date, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat('en-US', options).formatToParts(date);
}

function partNumber(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  return Number(parts.find((part) => part.type === type)?.value ?? '0');
}

function normalizeHour(hour: number): number {
  return hour === 24 ? 0 : hour;
}

export function getGregorianWallClockInTehran(date: Date): {
  gy: number;
  gm: number;
  gd: number;
  hour: number;
  minute: number;
} {
  const parts = readIntlParts(date, {
    timeZone: TEHRAN_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  return {
    gy: partNumber(parts, 'year'),
    gm: partNumber(parts, 'month'),
    gd: partNumber(parts, 'day'),
    hour: normalizeHour(partNumber(parts, 'hour')),
    minute: partNumber(parts, 'minute'),
  };
}

function getPersianWallClockInTehran(date: Date): {
  jy: number;
  jm: number;
  jd: number;
  hour: number;
  minute: number;
} {
  const parts = readIntlParts(date, {
    timeZone: TEHRAN_TZ,
    calendar: 'persian',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  return {
    jy: partNumber(parts, 'year'),
    jm: partNumber(parts, 'month'),
    jd: partNumber(parts, 'day'),
    hour: normalizeHour(partNumber(parts, 'hour')),
    minute: partNumber(parts, 'minute'),
  };
}

export function tehranGregorianToDate(
  gy: number,
  gm: number,
  gd: number,
  hour: number,
  minute: number,
): Date {
  return new Date(
    `${gy}-${pad2(gm)}-${pad2(gd)}T${pad2(hour)}:${pad2(minute)}:00${TEHRAN_OFFSET}`,
  );
}

export function jalaaliToGregorianParts(jy: number, jm: number, jd: number) {
  const date = fromJalaali(jy, jm, jd, 12, 0);
  const { gy, gm, gd } = getGregorianWallClockInTehran(date);
  return { gy, gm, gd };
}

export function jalaaliToGregorianDateString(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaaliToGregorianParts(jy, jm, jd);
  return `${gy}-${pad2(gm)}-${pad2(gd)}`;
}

export function gregorianDateStringToDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const gy = Number(match[1]);
  const gm = Number(match[2]);
  const gd = Number(match[3]);
  const date = tehranGregorianToDate(gy, gm, gd, 12, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toGregorianDateStringInTehran(date: Date): string {
  const { gy, gm, gd } = getGregorianWallClockInTehran(date);
  return `${gy}-${pad2(gm)}-${pad2(gd)}`;
}

export function tehranDayBoundaryIso(date: Date, endOfDay: boolean): string {
  const { gy, gm, gd } = getGregorianWallClockInTehran(date);
  if (endOfDay) {
    return new Date(`${gy}-${pad2(gm)}-${pad2(gd)}T23:59:59.999${TEHRAN_OFFSET}`).toISOString();
  }
  return tehranGregorianToDate(gy, gm, gd, 0, 0).toISOString();
}

export function toJalaali(date: Date): { jy: number; jm: number; jd: number; hour: number; minute: number } {
  return getPersianWallClockInTehran(date);
}

export function fromJalaali(
  jy: number,
  jm: number,
  jd: number,
  hour: number,
  minute: number,
): Date {
  const approxGy = jy + 621;

  for (let gy = approxGy - 1; gy <= approxGy + 1; gy += 1) {
    for (let gm = 1; gm <= 12; gm += 1) {
      const daysInGregorianMonth = gm === 2 ? 29 : [4, 6, 9, 11].includes(gm) ? 30 : 31;
      for (let gd = 1; gd <= daysInGregorianMonth; gd += 1) {
        const probe = tehranGregorianToDate(gy, gm, gd, 12, 0);
        const persian = getPersianWallClockInTehran(probe);
        if (persian.jy === jy && persian.jm === jm && persian.jd === jd) {
          return tehranGregorianToDate(gy, gm, gd, hour, minute);
        }
      }
    }
  }

  throw new Error(`Invalid Jalaali date ${jy}/${jm}/${jd}`);
}

export const JALAALI_MONTHS_FA = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export function daysInJalaaliMonth(jy: number, jm: number): number {
  const nextJm = jm === 12 ? 1 : jm + 1;
  const nextJy = jm === 12 ? jy + 1 : jy;
  const start = fromJalaali(jy, jm, 1, 12, 0);
  const end = fromJalaali(nextJy, nextJm, 1, 12, 0);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function formatPlainFa(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString('fa-IR', { useGrouping: false, ...options });
}

export function formatJalaaliDateTime(date: Date): string {
  const { jy, jm, jd, hour, minute } = toJalaali(date);
  const month = JALAALI_MONTHS_FA[jm - 1] ?? String(jm);
  return `${formatPlainFa(jd)} ${month} ${formatPlainFa(jy)} ${formatPlainFa(hour, { minimumIntegerDigits: 2 })}:${formatPlainFa(minute, { minimumIntegerDigits: 2 })}`;
}

export function parseDateInput(value: Date | string): Date | null {
  if (typeof value === 'string') {
    const dateOnly = gregorianDateStringToDate(value);
    if (dateOnly) {
      return dateOnly;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return Number.isNaN(value.getTime()) ? null : value;
}

/** تاریخ شمسی — فقط روز (بدون ساعت) */
export function formatPersianDate(value: Date | string): string {
  const date = parseDateInput(value);
  if (!date) {
    return '—';
  }
  const { jy, jm, jd } = toJalaali(date);
  const month = JALAALI_MONTHS_FA[jm - 1] ?? String(jm);
  return `${formatPlainFa(jd)} ${month} ${formatPlainFa(jy)}`;
}

/** تاریخ و ساعت شمسی */
export function formatPersianDateTime(value: Date | string): string {
  const date = parseDateInput(value);
  if (!date) {
    return '—';
  }
  return formatJalaaliDateTime(date);
}
