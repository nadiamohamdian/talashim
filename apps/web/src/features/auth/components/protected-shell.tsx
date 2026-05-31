'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { useAuth } from '@/features/auth/hooks/use-auth';

/**
 * Client-side safety net when the session expires while on a protected page.
 * Initial access is enforced by middleware (cookie); this handles SPA navigation.
 */
export function ProtectedShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      const returnPath = `${pathname}${window.location.search}`;
      router.replace(buildLoginHref(returnPath));
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600 dark:border-zinc-800 dark:bg-zinc-900">
        در حال بررسی احراز هویت...
      </div>
    );
  }

  return <>{children}</>;
}
