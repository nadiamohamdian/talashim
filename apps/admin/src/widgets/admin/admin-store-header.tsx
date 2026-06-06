import Link from 'next/link';
import { ExternalLink } from '@/shared/ui/icons';
import { adminEnv } from '@/shared/config/env';

export function AdminStoreHeader() {
  return (
    <header className="header-glass sticky top-0 z-30">
      <div
        className="mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ height: 'var(--header-height)' }}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--secondary)] text-xs font-bold text-[var(--secondary-foreground)] transition group-hover:bg-[var(--secondary-hover)]"
            aria-hidden
          >
            ط
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-overline text-[var(--primary)]">Talashim</span>
            <span className="mt-1 text-sm font-semibold text-foreground">
              {adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}
            </span>
          </span>
        </Link>
        <Link
          href="http://localhost:3000"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition hover:border-[var(--primary)]/30 hover:text-foreground"
        >
          فروشگاه
          <ExternalLink className="size-3" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
