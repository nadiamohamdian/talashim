import Image from 'next/image';
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
    <div className="auth-page store-chrome-light store-no-chrome">
      <AuthBackButton />

      <div className="auth-page-frame">
        <div className="auth-page-visual" aria-hidden>
          <Image
            src="/images/auth/1095b6ad420fd4c9f2835cf20045deaf 1.png"
            alt=""
            width={358}
            height={446}
            className="auth-page-visual-image"
            priority
          />
        </div>

        <div className="auth-page-inner">
          <header className="auth-page-header">
            <p className="auth-brand" aria-label="طلاشیم">
              Talashim
            </p>
            <span className="auth-brand-separator" aria-hidden />
            <p className="auth-brand-sub">گالری طلاشیم</p>
          </header>

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
    </div>
  );
}
