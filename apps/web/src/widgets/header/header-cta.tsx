'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';

const linkBase =
  'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors';

export function HeaderCta() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/prices"
        className={`${linkBase} text-stone-900 hover:bg-stone-100 dark:text-zinc-100 dark:hover:bg-zinc-800`}
      >
        قیمت روز
      </Link>
      <Link
        href="/login"
        className={`${linkBase} bg-amber-500 text-stone-950 hover:bg-amber-400`}
      >
        ورود
      </Link>
    </div>
  );
}
