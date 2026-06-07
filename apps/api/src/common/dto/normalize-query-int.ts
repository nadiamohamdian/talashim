export function normalizeOptionalInt(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined || value === 0) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
