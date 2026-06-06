/** Minimal Jalaali ↔ Gregorian conversion (no external deps). */

const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262,
  2324, 2394, 2456, 3178,
];

function jalCal(jy: number) {
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0]!;
  let jm: number;
  let jump: number;
  let leap: number;
  let n: number;
  let i: number;

  if (jy < jp || jy >= breaks[bl - 1]!) {
    throw new Error(`Invalid Jalaali year ${jy}`);
  }

  for (i = 1; i < bl; i += 1) {
    jm = breaks[i]!;
    jump = jm - jp;
    if (jy < jm) {
      break;
    }
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }
  leap = mod(div(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }
  return { leap, gy };
}

function div(a: number, b: number) {
  return ~~(a / b);
}

function mod(a: number, b: number) {
  return a - ~~(a / b) * b;
}

function g2d(gy: number, gm: number, gd: number) {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, jm <= 6 ? (jm - 1) * 31 + jd : (jm - 7) * 30 + jd + 186) + (r.leap === 0 && jm > 6 ? 1 : 0);
}

function d2j(jdn: number) {
  const g = d2g(jdn);
  let jy = g.gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(r.gy, 3, r.leap);
  let jd: number;
  let jm: number;
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) {
      k += 1;
    }
  }
  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

export function toJalaali(date: Date): { jy: number; jm: number; jd: number; hour: number; minute: number } {
  const { jy, jm, jd } = d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
  return { jy, jm, jd, hour: date.getHours(), minute: date.getMinutes() };
}

export function fromJalaali(
  jy: number,
  jm: number,
  jd: number,
  hour: number,
  minute: number,
): Date {
  const { gy, gm, gd } = d2g(j2d(jy, jm, jd));
  return new Date(gy, gm - 1, gd, hour, minute, 0, 0);
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
];

export function daysInJalaaliMonth(jy: number, jm: number): number {
  if (jm <= 6) {
    return 31;
  }
  if (jm <= 11) {
    return 30;
  }
  const r = jalCal(jy);
  return r.leap === 0 ? 30 : 29;
}

export function formatJalaaliDateTime(date: Date): string {
  const { jy, jm, jd, hour, minute } = toJalaali(date);
  const month = JALAALI_MONTHS_FA[jm - 1] ?? String(jm);
  return `${jd.toLocaleString('fa-IR')} ${month} ${jy.toLocaleString('fa-IR')}، ${hour.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}:${minute.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`;
}

export function parseDateInput(value: Date | string): Date | null {
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

/** تاریخ شمسی — فقط روز (بدون ساعت) */
export function formatPersianDate(value: Date | string): string {
  const date = parseDateInput(value);
  if (!date) {
    return '—';
  }
  const { jy, jm, jd } = toJalaali(date);
  const month = JALAALI_MONTHS_FA[jm - 1] ?? String(jm);
  return `${jd.toLocaleString('fa-IR')} ${month} ${jy.toLocaleString('fa-IR')}`;
}

/** تاریخ و ساعت شمسی */
export function formatPersianDateTime(value: Date | string): string {
  const date = parseDateInput(value);
  if (!date) {
    return '—';
  }
  return formatJalaaliDateTime(date);
}
