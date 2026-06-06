import Link from 'next/link';
import { ExternalLink } from '@/shared/ui/icons';
import { adminEnv } from '@/shared/config/env';

export function AdminStoreHeader() {
  return (
    <header className="header-glass sticky top-0 z-30">
      <div
        className="mx-auto flex items-center justify-between px-4 sm:px-6"
        style={{ height: 'var(--header-height)' }}
      >
        <Link href="/" className="group flex items-center gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary)] text-sm font-bold text-white shadow-[var(--shadow-xs)] transition group-hover:shadow-[var(--shadow-soft)]"
            aria-hidden
          >
            ط
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              Talashim
            </span>
            <span className="text-sm font-bold text-foreground">
              {adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}
            </span>
          </span>
        </Link>
        <Link
          href="http://localhost:3000"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-xs)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          فروشگاه
          <ExternalLink className="size-3" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
