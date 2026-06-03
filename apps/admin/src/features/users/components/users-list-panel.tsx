'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
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
} from '@talashim/ui';
import { getRoleLabelFa } from '@talashim/shared/admin-rbac';
import { fetchUsers } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { UsersPageShell } from './users-page-shell';
import { KYC_STATUS_FA, selectFieldClass, USER_ROLE_OPTIONS } from '../lib/labels';

export function UsersListPanel() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [customersOnly, setCustomersOnly] = useState(true);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.users(page, search, customersOnly && !role ? 'CUSTOMER' : role),
    queryFn: () =>
      fetchUsers({
        page,
        search: search || undefined,
        role: role || (customersOnly ? 'CUSTOMER' : undefined),
        staffOnly: false,
      }),
  });

  return (
    <UsersPageShell routeId="users.list">
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
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              className="rounded border-border"
              checked={customersOnly}
              disabled={Boolean(role)}
              onChange={(e) => {
                setCustomersOnly(e.target.checked);
                setPage(1);
              }}
            />
            فقط مشتریان
          </label>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری کاربران ناموفق بود.</p>
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
                  <TableCell colSpan={6} className="py-8 text-center text-stone-500">
                    کاربری یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((user) => {
                  const kycStatus = user.kycVerification?.status;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="text-sm text-stone-600" dir="ltr">
                        {user.email}
                      </TableCell>
                      <TableCell>{getRoleLabelFa(String(user.role).toLowerCase())}</TableCell>
                      <TableCell>
                        {kycStatus ? (
                          <Badge className="bg-nude-100 text-stone-700">
                            {KYC_STATUS_FA[kycStatus] ?? kycStatus}
                          </Badge>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-stone-500">
                        {new Date(user.createdAt).toLocaleDateString('fa-IR')}
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
