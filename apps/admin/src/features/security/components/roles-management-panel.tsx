'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@talashim/ui';
import { ADMIN_ROLE_DEFINITIONS, getRoleLabelFa } from '@talashim/shared/admin-rbac';
import type { AdminUser, CreateStaffUserPayload } from '@/features/admin/model/types';
import type { StaffRoleEnum } from '@sadafgold/types';
import {
  createStaffUser,
  fetchUsers,
  revokeStaffUserSessions,
  updateStaffUser,
  updateUserRole,
} from '@/features/admin/api/admin-api';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { SecurityPageShell } from './security-page-shell';
import { StaffUserEditDialog, type StaffUserEditValues } from './staff-user-edit-dialog';
import { selectFieldClass } from '../lib/labels';

const STAFF_ROLES = ADMIN_ROLE_DEFINITIONS.map((r) => r.enum);

type StaffRoleEnumLocal = (typeof STAFF_ROLES)[number];

const DEFAULT_CREATE_ROLE: StaffRoleEnum = 'SUPPORT';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) {
      return message.join('، ');
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return fallback;
}

function useAssignableStaffRoles() {
  const currentRoleSlug = useAdminAuthStore((s) => s.user?.role);
  const isSuperAdmin = currentRoleSlug === 'super_admin';
  return STAFF_ROLES.filter((role) => isSuperAdmin || role !== 'SUPER_ADMIN');
}

export function RolesAssignmentContent() {
  const queryClient = useQueryClient();
  const assignableRoles = useAssignableStaffRoles();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createEmail, setCreateEmail] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<StaffRoleEnum>(DEFAULT_CREATE_ROLE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.staffUsers(page, search),
    queryFn: () => fetchUsers({ page, search: search || undefined, staffOnly: true }),
  });

  const invalidateStaffQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'staff-users'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: StaffRoleEnumLocal }) =>
      updateUserRole(userId, role),
    onSuccess: () => invalidateStaffQueries(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateStaffUserPayload) => createStaffUser(payload),
    onSuccess: (user) => {
      setCreateError(null);
      setCreateSuccess(`پرسنل ${user.email} با موفقیت ایجاد شد.`);
      setCreateEmail('');
      setCreateFullName('');
      setCreatePassword('');
      setCreateRole(DEFAULT_CREATE_ROLE);
      invalidateStaffQueries();
    },
    onError: (error) => {
      setCreateSuccess(null);
      setCreateError(getApiErrorMessage(error, 'ایجاد پرسنل ناموفق بود.'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      userId,
      values,
    }: {
      userId: string;
      values: StaffUserEditValues;
    }) => {
      const payload = {
        email: values.email,
        fullName: values.fullName,
        role: values.role as StaffRoleEnum,
        ...(values.password.trim() ? { password: values.password.trim() } : {}),
      };
      const user = await updateStaffUser(userId, payload);
      if (values.password.trim()) {
        await revokeStaffUserSessions(userId);
      }
      return user;
    },
    onSuccess: () => {
      setEditError(null);
      setEditingUser(null);
      invalidateStaffQueries();
    },
    onError: (error) => {
      setEditError(getApiErrorMessage(error, 'ویرایش پرسنل ناموفق بود.'));
    },
  });

  const canCreate = useMemo(
    () =>
      createEmail.trim().length > 0 &&
      createFullName.trim().length >= 2 &&
      createPassword.length >= 8,
    [createEmail, createFullName, createPassword],
  );

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate || createMutation.isPending) {
      return;
    }
    setCreateSuccess(null);
    createMutation.mutate({
      email: createEmail.trim(),
      fullName: createFullName.trim(),
      password: createPassword,
      role: createRole,
    });
  };

  return (
    <>
      <div className="card-luxury p-5">
        <h2 className="text-sm font-semibold text-foreground">نقش‌های تعریف‌شده</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
          پرسنل جدید از فرم زیر یا API{' '}
          <code className="text-xs" dir="ltr">
            POST /admin/staff
          </code>{' '}
          اضافه می‌شود. تغییر نقش از جدول یا{' '}
          <code className="text-xs" dir="ltr">
            PATCH /admin/staff/:id
          </code>{' '}
          انجام می‌شود.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_ROLE_DEFINITIONS.map((role) => (
            <li
              key={role.slug}
              className="rounded-[var(--radius-xl)] border border-border bg-[var(--surface)]/80 px-3 py-2 text-sm"
            >
              <span className="font-medium text-foreground">{role.labelFa}</span>
              <span className="mt-0.5 block text-xs text-muted">{role.permissions.length} مجوز</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-luxury p-5">
        <h2 className="text-sm font-semibold text-foreground">افزودن پرسنل جدید</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">ایمیل، نام، رمز عبور و نقش پرسنل را وارد کنید.</p>

        <form className="mt-4 grid gap-4 lg:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <Label htmlFor="create-staff-email">ایمیل</Label>
            <Input
              id="create-staff-email"
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
            <Label htmlFor="create-staff-name">نام</Label>
            <Input
              id="create-staff-name"
              className="mt-1"
              value={createFullName}
              onChange={(e) => setCreateFullName(e.target.value)}
              placeholder="نام کامل پرسنل"
            />
          </div>

          <div>
            <Label htmlFor="create-staff-password">رمز عبور</Label>
            <Input
              id="create-staff-password"
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
            <Label htmlFor="create-staff-role">نقش</Label>
            <select
              id="create-staff-role"
              className={`${selectFieldClass} mt-1 w-full`}
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as StaffRoleEnum)}
            >
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {getRoleLabelFa(role.toLowerCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-end gap-3 lg:col-span-2">
            <Button type="submit" disabled={!canCreate || createMutation.isPending}>
              {createMutation.isPending ? 'در حال ایجاد…' : 'افزودن پرسنل'}
            </Button>
          </div>
        </form>

        {createSuccess ? <Alert variant="success" className="mt-4">{createSuccess}</Alert> : null}
        {createError ? (
          <Alert variant="destructive" className="mt-4">
            {createError}
          </Alert>
        ) : null}
      </div>

      <div className="card-luxury p-4">
        <Label>جستجوی پرسنل</Label>
        <Input
          className="mt-2 max-w-md"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ایمیل یا نام"
        />
      </div>

      <div className="card-luxury overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>نقش فعلی</TableHead>
                <TableHead>تغییر نقش</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted">
                    کاربر پرسنلی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </TableCell>
                    <TableCell>{getRoleLabelFa(String(user.role))}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className={selectFieldClass}
                          defaultValue={String(user.role).toUpperCase()}
                          onChange={(e) => {
                            const role = e.target.value as StaffRoleEnumLocal;
                            roleMutation.mutate({ userId: user.id, role });
                          }}
                        >
                          {assignableRoles.map((role) => (
                            <option key={role} value={role}>
                              {getRoleLabelFa(role.toLowerCase())}
                            </option>
                          ))}
                        </select>
                        {roleMutation.isPending ? (
                          <span className="text-xs text-muted">در حال ذخیره…</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setEditError(null);
                          setEditingUser(user);
                        }}
                      >
                        ویرایش / رمز
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {data && data.total > data.limit ? (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </Button>
          <span className="flex items-center text-sm text-[var(--muted-foreground)]">صفحه {page}</span>
          <Button
            variant="outline"
            disabled={page * data.limit >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </Button>
        </div>
      ) : null}

      {editingUser ? (
        <StaffUserEditDialog
          user={editingUser}
          assignableRoles={assignableRoles}
          isPending={updateMutation.isPending}
          errorMessage={editError}
          onClose={() => {
            setEditingUser(null);
            setEditError(null);
          }}
          onSubmit={(values) => {
            updateMutation.mutate({ userId: editingUser.id, values });
          }}
        />
      ) : null}
    </>
  );
}

interface RolesManagementPanelProps {
  routeId?: 'security.roles' | 'users.roles';
}

export function RolesManagementPanel({ routeId = 'security.roles' }: RolesManagementPanelProps) {
  return (
    <SecurityPageShell routeId={routeId}>
      <RolesAssignmentContent />
    </SecurityPageShell>
  );
}
