export function resolveSafeReturnPath(raw: string | null): string {
  if (!raw) {
    return '/products';
  }

  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return '/products';
  }

  return raw;
}
