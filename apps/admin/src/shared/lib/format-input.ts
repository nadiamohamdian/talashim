import { formatGroupedIntegerFa, parseGroupedIntegerDigits } from '@sadafgold/shared';

/** Strip everything except ASCII digits from formatted Persian/English numbers. */
export function parseIntegerDigits(value: string): string {
  return parseGroupedIntegerDigits(value);
}

export function parseIntegerDigitsToNumber(value: string): number {
  const raw = parseIntegerDigits(value);
  if (!raw) {
    return 0;
  }
  return Number(raw);
}

export function formatIntegerFa(value: string | number): string {
  return formatGroupedIntegerFa(value);
}
