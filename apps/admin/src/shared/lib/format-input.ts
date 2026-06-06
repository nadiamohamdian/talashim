/** Strip everything except ASCII digits from formatted Persian/English numbers. */
export function parseIntegerDigits(value: string): string {
  return value.replace(/[^\d]/g, '');
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
