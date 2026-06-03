/** Minimal JWT shape check so empty/garbage cookies do not count as a session. */
export function isLikelyAccessToken(value: string | undefined): boolean {
  if (!value || value.length < 32) {
    return false;
  }
  return value.split('.').length === 3;
}
