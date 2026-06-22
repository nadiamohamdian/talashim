'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useSessionRestoreStatus } from '@/features/auth/context/session-restore-context';

interface MemberLoginPromptProps {
  title: string;
  description: string;
  returnPath: string;
  children?: React.ReactNode;
}

/** Renders children when signed in; otherwise redirects to login. */
export function MemberLoginPrompt({
  returnPath,
  children,
}: MemberLoginPromptProps) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const restoreStatus = useSessionRestoreStatus();
  const { isAuthenticated } = useAuth();
  const restoring = restoreStatus === 'restoring';

  useEffect(() => {
    if (!hydrated || restoring || isAuthenticated) {
      return;
    }

    router.replace(buildLoginHref(returnPath));
  }, [hydrated, restoring, isAuthenticated, returnPath, router]);

  if (!hydrated || restoring || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
