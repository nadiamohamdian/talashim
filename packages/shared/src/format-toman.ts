const EASTERN_DIGIT_TO_ASCII: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const TOMAN_AMOUNT_FORMATTER = new Intl.NumberFormat('fa-IR', {
  useGrouping: true,
  maximumFractionDigits: 0,
});

export const TOMAN_UNIT_FA = 'تومان';

function normalizeEasternDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => EASTERN_DIGIT_TO_ASCII[digit] ?? digit);
}

/** Strip separators and non-digits; keeps ASCII digits only. */
export function parseGroupedIntegerDigits(value: string): string {
  return normalizeEasternDigits(value).replace(/[^\d]/g, '');
}

/** Format integer amounts with Persian grouping (e.g. ۱٬۲۳۴٬۵۶۷). */
export function formatGroupedIntegerFa(value: string | number): string {
  const raw =
    typeof value === 'number'
      ? String(Math.round(value))
      : parseGroupedIntegerDigits(value);
  if (!raw) {
    return '';
  }
  return TOMAN_AMOUNT_FORMATTER.format(Number(raw));
}

function toFiniteNumber(value: number | string): number | null {
  const n = typeof value === 'string' ? Number(parseGroupedIntegerDigits(value)) : value;
  if (!Number.isFinite(n)) {
    return null;
  }
  return n;
}

/** Canonical Toman display formatter for prices and monetary amounts. */
export function formatTomanAmount(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return '—';
  }
  const n = toFiniteNumber(value);
  if (n == null) {
    return '—';
  }
  return TOMAN_AMOUNT_FORMATTER.format(Math.round(n));
}

export function formatTomanAmountWithUnit(value: number | string | null | undefined): string {
  const formatted = formatTomanAmount(value);
  return formatted === '—' ? formatted : `${formatted} ${TOMAN_UNIT_FA}`;
}
