'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { MemberLoginPrompt } from '@/features/auth/components/member-login-prompt';
import { AccountSidebar } from '@/widgets/account/account-sidebar';
import { useAccountSidebarNavItems } from '@/widgets/account/account-sidebar-nav';

interface AccountShellProps extends PropsWithChildren {
  title: string;
  description?: string;
  returnPath: string;
  hideMainHeader?: boolean;
  alignMainWithSidebarProfile?: boolean;
  pageClassName?: string;
}

export function AccountShell({
  title,
  description,
  returnPath,
  hideMainHeader = false,
  alignMainWithSidebarProfile = false,
  pageClassName,
  children,
}: AccountShellProps) {
  const pathname = usePathname();
  const navItems = useAccountSidebarNavItems();

  const isActive = (href: string, matcher?: (pathname: string) => boolean) =>
    matcher ? matcher(pathname) : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <MemberLoginPrompt
      title={title}
      description={description ?? 'برای دسترسی به این بخش وارد حساب کاربری شوید.'}
      returnPath={returnPath}
    >
      <div
        className={[
          'account-page store-chrome-light store-minimal-header',
          pageClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="account-page-inner">
          <nav className="account-page-nav-mobile" aria-label="حساب کاربری">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`account-page-nav-link${isActive(item.href, item.isActive) ? ' is-active' : ''}`}
                aria-current={isActive(item.href, item.isActive) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="account-page-layout">
            <AccountSidebar />

            <div
              className={[
                'account-page-main',
                alignMainWithSidebarProfile ? 'account-page-main--profile-aligned' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {hideMainHeader ? null : (
                <header className="account-page-header">
                  <h1 className="account-page-title">{title}</h1>
                  {description ? (
                    <p className="account-page-description">{description}</p>
                  ) : null}
                </header>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    </MemberLoginPrompt>
  );
}
