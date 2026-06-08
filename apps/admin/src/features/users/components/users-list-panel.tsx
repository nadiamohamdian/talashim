'use client';

import { formatPersianDate } from '@/shared/lib/format-date';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { ADMIN_ROLE_DEFINITIONS, getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import type { StaffRoleEnum } from '@sadafgold/types';
import { createStaffUser, fetchUsers } from '@/features/admin/api/admin-api';
import { useAdminPermission } from '@/features/auth/hooks/use-admin-permission';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { UsersPageShell } from './users-page-shell';
import { KYC_STATUS_FA, selectFieldClass, USER_ROLE_OPTIONS } from '../lib/labels';

const STAFF_ROLES = ADMIN_ROLE_DEFINITIONS.map((r) => r.enum);
const DEFAULT_CREATE_ROLE: StaffRoleEnum = 'SUPPORT';

export function UsersListPanel() {
  const queryClient = useQueryClient();
  const canManageStaff = useAdminPermission(ADMIN_PERMISSIONS.security.rbac);
  const currentRoleSlug = useAdminAuthStore((s) => s.user?.role);
  const isSuperAdmin = currentRoleSlug === 'super_admin';
  const assignableRoles = useMemo(
    () => STAFF_ROLES.filter((role) => isSuperAdmin || role !== 'SUPER_ADMIN'),
    [isSuperAdmin],
  );

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateStaffForm, setShowCreateStaffForm] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<StaffRoleEnum>(DEFAULT_CREATE_ROLE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.users(page, search, role),
    queryFn: () =>
      fetchUsers({
        page,
        search: search || undefined,
        role: role || undefined,
        staffOnly: false,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createStaffUser,
    onSuccess: (user) => {
      setCreateError(null);
      setCreateSuccess(`کاربر پرسنلی ${user.email} با موفقیت ایجاد شد.`);
      setCreateEmail('');
      setCreateFullName('');
      setCreatePassword('');
      setCreateRole(DEFAULT_CREATE_ROLE);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'staff-users'] });
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (
              error as { response?: { data?: { message?: string | string[] } } }
            ).response?.data?.message
          : undefined;

      if (Array.isArray(message)) {
        setCreateError(message.join('، '));
      } else if (typeof message === 'string' && message.trim()) {
        setCreateError(message);
      } else {
        setCreateError('ایجاد کاربر پرسنلی ناموفق بود.');
      }
      setCreateSuccess(null);
    },
  });

  const canCreateStaff =
    createEmail.trim().length > 0 && createFullName.trim().length >= 2 && createPassword.length >= 8;

  return (
    <UsersPageShell
      routeId="users.list"
      actions={
        canManageStaff ? (
          <Button type="button" variant="outline" onClick={() => setShowCreateStaffForm((s) => !s)}>
            {showCreateStaffForm ? 'بستن فرم افزودن' : 'افزودن کاربر'}
          </Button>
        ) : undefined
      }
    >
      {canManageStaff && showCreateStaffForm ? (
        <Card className="border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <h3 className="text-sm font-semibold text-foreground">افزودن کاربر پرسنلی</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            برای ایجاد کاربر پنل مدیریت، ایمیل، نام، رمز عبور و نقش را وارد کنید.
          </p>

          <form
            className="mt-4 grid gap-4 lg:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!canCreateStaff || createMutation.isPending) {
                return;
              }
              setCreateSuccess(null);
              createMutation.mutate({
                email: createEmail.trim(),
                fullName: createFullName.trim(),
                password: createPassword,
                role: createRole,
              });
            }}
          >
            <div>
              <Label htmlFor="users-create-staff-email">ایمیل</Label>
              <Input
                id="users-create-staff-email"
                type="email"
                className="mt-1"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="staff@talashim.local"
                dir="ltr"
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="users-create-staff-name">نام</Label>
              <Input
                id="users-create-staff-name"
                className="mt-1"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="نام کامل"
              />
            </div>

            <div>
              <Label htmlFor="users-create-staff-password">رمز عبور</Label>
              <Input
                id="users-create-staff-password"
                type="password"
                className="mt-1"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="users-create-staff-role">نقش</Label>
              <select
                id="users-create-staff-role"
                className={`${selectFieldClass} mt-1 w-full`}
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as StaffRoleEnum)}
              >
                {assignableRoles.map((item) => (
                  <option key={item} value={item}>
                    {getRoleLabelFa(item.toLowerCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <Button type="submit" disabled={!canCreateStaff || createMutation.isPending}>
                {createMutation.isPending ? 'در حال ایجاد…' : 'ایجاد کاربر'}
              </Button>
            </div>
          </form>

          {createSuccess ? (
            <Alert className="mt-4 border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]">
              {createSuccess}
            </Alert>
          ) : null}
          {createError ? (
            <Alert className="mt-4 border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]">
              {createError}
            </Alert>
          ) : null}
        </Card>
      ) : null}

      <FilterBar>
        <div className="min-w-[220px] flex-1">
          <Label>جستجو</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ایمیل یا نام"
          />
        </div>
        <div>
          <Label>نقش</Label>
          <select
            className={`${selectFieldClass} mt-1`}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            {USER_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری کاربران ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>ثبت‌نام</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted">
                    کاربری یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((user) => {
                  const kycStatus = user.kycVerification?.status;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="text-sm text-[var(--muted-foreground)]" dir="ltr">
                        {user.email}
                      </TableCell>
                      <TableCell>{getRoleLabelFa(String(user.role).toLowerCase())}</TableCell>
                      <TableCell>
                        {kycStatus ? (
                          <Badge className="bg-nude-100 text-[var(--muted-foreground)]">
                            {KYC_STATUS_FA[kycStatus] ?? kycStatus}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {formatPersianDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/users/${user.id}`}
                          className="text-sm font-medium text-gold-dark hover:underline"
                        >
                          جزئیات
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {data ? (
        <PaginationBar
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      ) : null}
    </UsersPageShell>
  );
}
