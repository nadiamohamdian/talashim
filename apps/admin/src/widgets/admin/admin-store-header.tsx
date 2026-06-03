import Link from 'next/link';
import { adminEnv } from '@/shared/config/env';

export function AdminStoreHeader() {
  return (
    <header className="header-glass sticky top-0 z-30 border-b border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-800">
            Talashim
          </span>
          <span className="text-sm font-bold text-stone-900">
            {adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}
          </span>
        </Link>
        <Link
          href="http://localhost:3000"
          className="text-xs font-semibold text-amber-800 transition hover:text-amber-950"
        >
          فروشگاه
        </Link>
      </div>
    </header>
  );
}
