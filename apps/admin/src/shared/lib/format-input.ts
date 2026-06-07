/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits mapped to ASCII. */
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

function normalizeEasternDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => EASTERN_DIGIT_TO_ASCII[digit] ?? digit);
}

/** Strip everything except ASCII digits from formatted Persian/English numbers. */
export function parseIntegerDigits(value: string): string {
  return normalizeEasternDigits(value).replace(/[^\d]/g, '');
}

export function parseIntegerDigitsToNumber(value: string): number {
  const raw = parseIntegerDigits(value);
  if (!raw) {
    return 0;
  }
  return Number(raw);
}

export function formatIntegerFa(value: string | number): string {
  const raw = typeof value === 'number' ? String(value) : parseIntegerDigits(value);
  if (!raw) {
    return '';
  }
  return Number(raw).toLocaleString('fa-IR');
}
