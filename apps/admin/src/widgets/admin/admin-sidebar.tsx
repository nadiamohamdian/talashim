'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@sadafgold/ui';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { ADMIN_NAV_SECTIONS, type ApiAvailability } from '@/shared/config/admin-navigation';
import { isNavItemActive } from '@/shared/lib/admin-route-resolver';
import {
  syncAdminAuthCookieFromStore,
  useAdminAuthStore,
} from '@/features/auth/model/admin-auth-store';

const availabilityDot: Record<ApiAvailability, string> = {
  live: 'bg-emerald-500',
  partial: 'bg-amber-500',
  pending: 'bg-nude-300',
};

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const clearSession = useAdminAuthStore((s) => s.clearSession);
  const user = useAdminAuthStore((s) => s.user);
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <aside className="flex h-full flex-col bg-nude-50 text-foreground">
      <div className="border-b border-border bg-white/80 p-4">
        <p className="text-xs text-muted">کاربر فعال</p>
        {user ? (
          <>
            <p className="mt-1 truncate text-sm font-medium text-stone-800">{user.email}</p>
            <p className="mt-0.5 text-xs text-muted">{getRoleLabelFa(user.role)}</p>
          </>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="منوی اصلی">
        {ADMIN_NAV_SECTIONS.map((section) => {
          const isSectionCollapsed = collapsed[section.id];
          return (
            <div key={section.id} className="mb-4">
              <button
                type="button"
                className="mb-1 flex w-full items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted hover:text-stone-700"
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                }
              >
                {section.label}
                <span className="text-nude-300">{isSectionCollapsed ? '+' : '−'}</span>
              </button>
              {!isSectionCollapsed ? (
                <ul className="space-y-0.5">
                  {section.items
                    .filter((item) => hasPermission(item.permission as AdminPermissionKey))
                    .map((item) => {
                      const active = isNavItemActive(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => {
                              syncAdminAuthCookieFromStore();
                              onNavigate?.();
                            }}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                              active
                                ? 'border border-gold-light bg-white font-medium text-gold-dark shadow-sm'
                                : 'text-stone-600 hover:bg-white/70 hover:text-stone-900'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${availabilityDot[item.availability]}`}
                              title={item.availability}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border bg-white/80 p-4">
        <Button
          variant="outline"
          className="w-full border-border bg-white text-stone-700 hover:border-gold-light hover:bg-nude-50"
          onClick={() => {
            clearSession();
            window.location.href = '/login';
          }}
        >
          خروج
        </Button>
      </div>
    </aside>
  );
}
