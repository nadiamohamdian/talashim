'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
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
import { fetchUsers, updateUserRole } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { SecurityPageShell } from './security-page-shell';
import { selectFieldClass } from '../lib/labels';

const STAFF_ROLES = ADMIN_ROLE_DEFINITIONS.map((r) => r.enum);

type StaffRoleEnum = (typeof STAFF_ROLES)[number];

interface RolesManagementPanelProps {
  routeId?: 'security.roles' | 'users.roles';
}

export function RolesManagementPanel({ routeId = 'security.roles' }: RolesManagementPanelProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.staffUsers(page, search),
    queryFn: () => fetchUsers({ page, search: search || undefined, staffOnly: true }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: StaffRoleEnum }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'staff-users'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return (
    <SecurityPageShell routeId={routeId}>
      <div className="card-luxury p-5">
        <h2 className="text-sm font-semibold text-stone-900">نقش‌های تعریف‌شده</h2>
        <p className="mt-2 text-sm leading-7 text-stone-600">
          پنج نقش پرسنلی برای فروشگاه تک‌فروشنده تلاشیم. تخصیص نقش از جدول زیر یا API{' '}
          <code className="text-xs" dir="ltr">
            PATCH /admin/users/:id/role
          </code>{' '}
          انجام می‌شود.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_ROLE_DEFINITIONS.map((role) => (
            <li
              key={role.slug}
              className="rounded-xl border border-border bg-nude-50/80 px-3 py-2 text-sm"
            >
              <span className="font-medium text-stone-900">{role.labelFa}</span>
              <span className="mt-0.5 block text-xs text-stone-500">{role.permissions.length} مجوز</span>
            </li>
          ))}
        </ul>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-stone-500">
                    کاربر پرسنلی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-stone-500">{user.email}</p>
                    </TableCell>
                    <TableCell>{getRoleLabelFa(String(user.role))}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className={selectFieldClass}
                          defaultValue={String(user.role).toUpperCase()}
                          onChange={(e) => {
                            const role = e.target.value as StaffRoleEnum;
                            roleMutation.mutate({ userId: user.id, role });
                          }}
                        >
                          {STAFF_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {getRoleLabelFa(role.toLowerCase())}
                            </option>
                          ))}
                        </select>
                        {roleMutation.isPending ? (
                          <span className="text-xs text-stone-500">در حال ذخیره…</span>
                        ) : null}
                      </div>
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
          <span className="flex items-center text-sm text-stone-600">صفحه {page}</span>
          <Button
            variant="outline"
            disabled={page * data.limit >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </Button>
        </div>
      ) : null}
    </SecurityPageShell>
  );
}
