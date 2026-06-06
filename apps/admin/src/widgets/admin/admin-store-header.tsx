import Link from 'next/link';
import { adminEnv } from '@/shared/config/env';

export function AdminStoreHeader() {
  return (
    <header className="header-glass sticky top-0 z-30 border-b border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light to-gold text-sm font-bold text-white shadow-sm ring-1 ring-gold-light/60 transition group-hover:shadow-md"
            aria-hidden
          >
            ط
          </span>
          <span className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-800">
              Talashim
            </span>
            <span className="text-sm font-bold text-stone-900">
              {adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}
            </span>
          </span>
        </Link>
        <Link
          href="http://localhost:3000"
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm transition hover:border-gold-light hover:bg-nude-50 hover:text-amber-950"
        >
          فروشگاه
        </Link>
      </div>
    </header>
  );
}
