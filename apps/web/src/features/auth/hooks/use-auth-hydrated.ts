'use client';

/**
 * True after client mount. Auth state is memory-only (no localStorage tokens).
 */
export function useAuthHydrated(): boolean {
  return true;
}
