'use client';

import Link from 'next/link';
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
    <div className="store-login-prompt">
      <div className="auth-card store-login-prompt-card">
        <header className="auth-card-header store-login-prompt-header">
          <p className="auth-eyebrow">حساب کاربری</p>
          <h2 className="auth-title" aria-label={title}>
            {title}
          </h2>
          <p className="auth-description">{description}</p>
        </header>

        <div className="store-login-prompt-actions auth-card-body">
          <Link href={buildLoginHref(returnPath)} className="auth-submit">
            ورود
          </Link>
          <Link href="/products" className="store-login-prompt-secondary">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    </div>
  );
}
