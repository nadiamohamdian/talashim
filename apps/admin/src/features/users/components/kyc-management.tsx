'use client';

import { formatPersianDate } from '@/shared/lib/format-date';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { fetchKyc, reviewKyc } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { UsersPageShell } from './users-page-shell';
import { KYC_STATUS_FA, KYC_STATUS_OPTIONS, selectFieldClass } from '../lib/labels';

const kycBadgeClass: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-900',
  APPROVED: 'bg-emerald-50 text-emerald-800',
  REJECTED: 'bg-rose-50 text-rose-800',
};

export function KycManagement() {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.kyc(page, status),
    queryFn: () => fetchKyc({ page, status: status || undefined }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'APPROVED' | 'REJECTED' }) =>
      reviewKyc(id, { status: next }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });

  return (
    <UsersPageShell routeId="users.kyc">
      <FilterBar>
        <div>
          <Label>وضعیت</Label>
          <select
            className={`${selectFieldClass} mt-1`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {KYC_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری درخواست‌های KYC ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کاربر</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>کد ملی</TableHead>
                <TableHead>موبایل</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-stone-500">
                    درخواستی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.user.fullName}</TableCell>
                    <TableCell className="text-sm text-stone-600" dir="ltr">
                      {item.user.email}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.nationalId}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>
                      <Badge className={kycBadgeClass[item.status] ?? 'bg-stone-100 text-stone-700'}>
                        {KYC_STATUS_FA[item.status] ?? item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-500">
                      {formatPersianDate(item.submittedAt)}
                    </TableCell>
                    <TableCell>
                      {item.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <Button
                            variant="buy"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={reviewMutation.isPending}
                            onClick={() =>
                              reviewMutation.mutate({ id: item.id, next: 'APPROVED' })
                            }
                          >
                            تأیید
                          </Button>
                          <Button
                            variant="sell"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={reviewMutation.isPending}
                            onClick={() =>
                              reviewMutation.mutate({ id: item.id, next: 'REJECTED' })
                            }
                          >
                            رد
                          </Button>
                        </div>
                      ) : (
                        <Link
                          href={`/users/${item.userId}`}
                          className="text-sm font-medium text-gold-dark hover:underline"
                        >
                          پروفایل
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))
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
