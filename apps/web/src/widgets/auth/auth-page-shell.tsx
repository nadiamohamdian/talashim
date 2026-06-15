import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { AuthBackButton } from '@/features/auth/components/auth-back-button';

interface AuthPageShellProps extends PropsWithChildren {
  sectionTitle?: string;
  showSignupFooter?: boolean;
}

export function AuthPageShell({
  sectionTitle = 'ورود',
  showSignupFooter = false,
  children,
}: AuthPageShellProps) {
  return (
    <div className="auth-page store-chrome-light store-minimal-header">
      <AuthBackButton />

      <div className="auth-page-inner">
        <p className="auth-brand" aria-label="طلاشیم">
          Talashim
        </p>

        <h1 className="auth-section-title">{sectionTitle}</h1>

        <div className="auth-page-body">{children}</div>

        {showSignupFooter ? (
          <div className="auth-signup-footer">
            <span className="auth-signup-footer-line" aria-hidden />
            <p className="auth-signup-footer-text">
              <span>حساب کاربری ندارید؟</span>{' '}
              <Link href="/contact" className="auth-signup-link">
                ثبت نام
              </Link>
            </p>
            <span className="auth-signup-footer-line" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
