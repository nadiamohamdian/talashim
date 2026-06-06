'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
} from '@talashim/ui';
import { getRoleLabelFa } from '@talashim/shared/admin-rbac';
import { fetchLoginHistory } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { AUTH_ACTION_LABELS, getAuthActionLabel, selectFieldClass } from '../lib/labels';

export function LoginHistoryContent() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.loginHistory(page, search, action),
    queryFn: () =>
      fetchLoginHistory({
        page,
        search: search || undefined,
        action: action || undefined,
      }),
  });

  return (
    <>
      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input
            className="mt-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ایمیل کاربر"
          />
        </div>
        <div>
          <Label>نوع رویداد</Label>
          <select
            className={selectFieldClass}
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            {Object.entries(AUTH_ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <div className="card-luxury overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-sm text-rose-600">بارگذاری تاریخچه ورود ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رویداد</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-stone-500">
                    رویداد احراز هویتی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium text-stone-900">
                        {getAuthActionLabel(item.action)}
                      </p>
                      <p className="font-mono text-xs text-stone-400">{item.action}</p>
                    </TableCell>
                    <TableCell>{item.actor?.email ?? '—'}</TableCell>
                    <TableCell className="text-sm">
                      {item.actor ? getRoleLabelFa(item.actor.role) : '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-stone-600">
                      {formatPersianDateTime(item.createdAt)}
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
    </>
  );
}
