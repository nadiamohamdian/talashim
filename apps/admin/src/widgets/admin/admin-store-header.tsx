import Link from 'next/link';
import { ExternalLink } from '@/shared/ui/icons';
import { adminEnv } from '@/shared/config/env';
import { AdminThemeToggle } from '@/widgets/admin/admin-theme-toggle';

export function AdminStoreHeader() {
  return (
    <header className="admin-chrome-header sticky top-0 z-30">
      <div className="admin-chrome-header-inner">
        <Link href="/" className="admin-brand group">
          <span className="admin-brand-mark" aria-hidden>
            ط
          </span>
          <span className="admin-brand-text">
            <span className="admin-brand-en">Talashim</span>
            <span className="admin-brand-fa">{adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <AdminThemeToggle />
          <Link
            href="http://localhost:3000"
            className="admin-icon-btn admin-icon-btn--labeled"
            aria-label="فروشگاه"
          >
            <span className="admin-icon-btn-label">فروشگاه</span>
            <ExternalLink className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
