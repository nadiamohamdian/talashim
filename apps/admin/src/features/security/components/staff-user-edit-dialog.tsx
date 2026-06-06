'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Label } from '@talashim/ui';
import type { AdminUser } from '@/features/admin/model/types';
import { getRoleLabelFa } from '@talashim/shared/admin-rbac';
import { selectFieldClass } from '../lib/labels';

export interface StaffUserEditValues {
  email: string;
  fullName: string;
  password: string;
  role: string;
}

interface StaffUserEditDialogProps {
  user: AdminUser;
  assignableRoles: string[];
  isPending: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (values: StaffUserEditValues) => void;
}

export function StaffUserEditDialog({
  user,
  assignableRoles,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: StaffUserEditDialogProps) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.fullName);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(String(user.role).toUpperCase());

  useEffect(() => {
    setEmail(user.email);
    setFullName(user.fullName);
    setPassword('');
    setRole(String(user.role).toUpperCase());
  }, [user]);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !fullName.trim() || fullName.trim().length < 2) {
      return false;
    }
    if (password !== '' && password.length < 8) {
      return false;
    }
    return true;
  }, [email, fullName, password]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 admin-overlay"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-t-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--card)] shadow-[var(--shadow-dialog)] sm:rounded-[var(--radius-2xl)]"
      >
        <div className="admin-dialog-header">
          <h2 className="text-base font-bold text-foreground">ویرایش پرسنل</h2>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>

        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit || isPending) {
              return;
            }
            onSubmit({ email: email.trim(), fullName: fullName.trim(), password, role });
          }}
        >
          <div>
            <Label htmlFor="staff-edit-email">ایمیل</Label>
            <Input
              id="staff-edit-email"
              type="email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              autoComplete="off"
            />
          </div>

          <div>
            <Label htmlFor="staff-edit-name">نام</Label>
            <Input
              id="staff-edit-name"
              className="mt-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="staff-edit-password">رمز عبور جدید</Label>
            <Input
              id="staff-edit-password"
              type="password"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۸ کاراکتر — برای عدم تغییر خالی بگذارید"
              dir="ltr"
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="staff-edit-role">نقش</Label>
            <select
              id="staff-edit-role"
              className={`${selectFieldClass} mt-1 w-full`}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {assignableRoles.map((item) => (
                <option key={item} value={item}>
                  {getRoleLabelFa(item.toLowerCase())}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              انصراف
            </Button>
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
