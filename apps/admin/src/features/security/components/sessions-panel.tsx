'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
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
import { getRoleLabelFa } from '@talashim/shared/admin-rbac';
import {
  fetchSessions,
  revokeSession,
  revokeUserSessions,
} from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { SecurityPageShell } from './security-page-shell';
import { SESSION_STATUS_CLASS, SESSION_STATUS_LABELS, selectFieldClass } from '../lib/labels';

export function SessionsPanel() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'revoked' | 'expired' | 'all'>('active');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.sessions(page, search, status),
    queryFn: () => fetchSessions({ page, search: search || undefined, status }),
  });

  const revokeOne = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
    },
  });

  const revokeAll = useMutation({
    mutationFn: revokeUserSessions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
    },
  });

  return (
    <SecurityPageShell routeId="security.sessions">
      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو (ایمیل / نام)</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="support@talashim.local"
          />
        </div>
        <div>
          <Label>وضعیت</Label>
          <select
            className={selectFieldClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
          >
            <option value="active">فعال</option>
            <option value="revoked">لغو شده</option>
            <option value="expired">منقضی</option>
            <option value="all">همه</option>
          </select>
        </div>
      </FilterBar>

      <div className="card-luxury overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-sm text-rose-600">بارگذاری نشست‌ها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>ایجاد</TableHead>
                <TableHead>انقضا</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-stone-500">
                    نشستی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <p className="font-medium text-stone-900">{session.user.fullName}</p>
                      <p className="text-xs text-stone-500">{session.user.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getRoleLabelFa(session.user.role)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${SESSION_STATUS_CLASS[session.status]}`}
                      >
                        {SESSION_STATUS_LABELS[session.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-stone-600">
                      {new Date(session.createdAt).toLocaleString('fa-IR')}
                    </TableCell>
                    <TableCell className="text-xs text-stone-600">
                      {new Date(session.expiresAt).toLocaleString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {session.status === 'active' ? (
                          <Button
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            disabled={revokeOne.isPending}
                            onClick={() => revokeOne.mutate(session.id)}
                          >
                            لغو
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          className="px-3 py-1.5 text-xs text-rose-700 hover:text-rose-800"
                          disabled={revokeAll.isPending}
                          onClick={() => revokeAll.mutate(session.userId)}
                        >
                          لغو همه
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {data ? (
        <PaginationBar
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      ) : null}
    </SecurityPageShell>
  );
}
