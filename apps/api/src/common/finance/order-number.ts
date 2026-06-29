import { randomBytes } from 'node:crypto';

/** Opaque retail order number — not enumerable by timestamp alone. */
export function generateRetailOrderNumber(prefix = 'SG'): string {
  const entropy = randomBytes(5).toString('hex').toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timePart}${entropy}`;
}
