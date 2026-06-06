'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { syncAdminAuthCookieFromStore } from '@/features/auth/model/admin-auth-store';

export interface AdminSubnavLink {
  href: string;
  label: string;
}

interface AdminSubnavLinksProps {
  links: AdminSubnavLink[];
}

export function AdminSubnavLinks({ links }: AdminSubnavLinksProps) {
  const pathname = usePathname();

  return (
    <div className="admin-subnav">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            data-active={active}
            onClick={() => syncAdminAuthCookieFromStore()}
            className="admin-subnav-link"
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
