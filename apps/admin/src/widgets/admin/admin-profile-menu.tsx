'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut } from '@/shared/ui/icons';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';

export function AdminProfileMenu() {
  const user = useAdminAuthStore((s) => s.user);
  const clearSession = useAdminAuthStore((s) => s.clearSession);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const initial = (user.fullName ?? user.email).charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="admin-profile-menu relative">
      <button
        type="button"
        className="admin-profile-chip admin-profile-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="admin-profile-avatar" aria-hidden>
          {initial}
        </span>
        <span className="hidden min-w-0 xl:block">
          <span className="admin-profile-name">{user.fullName ?? user.email}</span>
          <span className="admin-profile-role">{getRoleLabelFa(user.role)}</span>
        </span>
        <ChevronDown
          className={`hidden size-3.5 text-muted transition-transform duration-200 xl:block ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="admin-dropdown admin-profile-dropdown" role="menu">
          <div className="admin-dropdown-header">
            <p className="text-sm font-semibold text-foreground">{user.fullName ?? user.email}</p>
            <p className="mt-0.5 text-caption">{user.email}</p>
            <span className="sidebar-badge-role mt-2 inline-flex">{getRoleLabelFa(user.role)}</span>
          </div>
          <div className="admin-dropdown-separator" />
          <Link href="/settings/general" className="admin-dropdown-item" role="menuitem" onClick={() => setOpen(false)}>
            تنظیمات حساب
          </Link>
          <div className="admin-dropdown-separator" />
          <button
            type="button"
            className="admin-dropdown-item admin-dropdown-item--danger w-full"
            role="menuitem"
            onClick={() => {
              clearSession();
              window.location.href = '/login';
            }}
          >
            <LogOut className="size-3.5" strokeWidth={1.5} aria-hidden />
            خروج از حساب
          </button>
        </div>
      ) : null}
    </div>
  );
}
