export function normalizeIranPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidIranMobile(value: string): boolean {
  return /^09\d{9}$/.test(normalizeIranPhone(value));
}
