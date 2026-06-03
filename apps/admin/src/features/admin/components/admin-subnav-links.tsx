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
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => syncAdminAuthCookieFromStore()}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              active
                ? 'bg-stone-900 text-white'
                : 'bg-nude-100 text-stone-600 hover:bg-white hover:text-stone-900'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
