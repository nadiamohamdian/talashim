'use client';

import { cloneElement, type MouseEvent, type PropsWithChildren, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface RequireAuthActionProps {
  children: ReactElement<{ onClick?: (event: MouseEvent) => void }>;
  returnPath?: string;
}

/**
 * Wraps a single actionable child (e.g. Button). Guests are sent to login with `next`.
 */
export function RequireAuthAction({ children, returnPath }: RequireAuthActionProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const originalOnClick = children.props.onClick;

  return cloneElement(children, {
    onClick: (event: MouseEvent) => {
      if (!isAuthenticated) {
        event.preventDefault();
        const path =
          returnPath ??
          (typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : '/');
        router.push(buildLoginHref(path));
        return;
      }
      originalOnClick?.(event);
    },
  });
}
