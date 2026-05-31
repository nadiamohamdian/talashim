'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@sadafgold/ui';
import { useAuth, useLogoutMutation } from '@/features/auth/hooks/use-auth';

interface AuthNavProps {
  protectedLinks: Array<{ href: Route; label: string }>;
}

export function AuthNav({ protectedLinks }: AuthNavProps) {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogoutMutation();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      {protectedLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-stone-700 dark:text-zinc-300"
        >
          {item.label}
        </Link>
      ))}
      <span className="text-sm text-stone-600 dark:text-zinc-400">{user.fullName}</span>
      <Button
        variant="ghost"
        className="px-3 py-1.5 text-sm"
        disabled={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        خروج
      </Button>
    </div>
  );
}
