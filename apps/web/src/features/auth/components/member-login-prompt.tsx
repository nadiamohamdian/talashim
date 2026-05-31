'use client';

import Link from 'next/link';
import { Card } from '@sadafgold/ui';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface MemberLoginPromptProps {
  title: string;
  description: string;
  returnPath: string;
  children?: React.ReactNode;
}

/** Shows children when signed in; otherwise a login CTA (no redirect). */
export function MemberLoginPrompt({
  title,
  description,
  returnPath,
  children,
}: MemberLoginPromptProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <h2 className="text-xl font-bold text-stone-950 dark:text-zinc-50">{title}</h2>
      <p className="mt-3 text-sm text-stone-600 dark:text-zinc-400">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={buildLoginHref(returnPath)}
          className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950"
        >
          ورود
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-zinc-300"
        >
          مشاهده محصولات
        </Link>
      </div>
    </Card>
  );
}
