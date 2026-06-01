'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { fetchAuditLogs } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { Label } from '@sadafgold/ui';
import { SecurityPageShell } from './security-page-shell';
import { SOURCE_LABELS, selectFieldClass } from '../lib/labels';

export function AuditLogPanel() {
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.audit(page, source),
    queryFn: () => fetchAuditLogs({ source: source || undefined, page }),
  });

  return (
    <SecurityPageShell routeId="security.audit">
      <FilterBar>
        <div>
          <Label>منبع</Label>
          <select
            className={selectFieldClass}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه منابع</option>
            <option value="platform">پلتفرم</option>
            <option value="wallet">کیف پول</option>
            <option value="trade">معاملات</option>
          </select>
        </div>
      </FilterBar>

      <div className="card-luxury overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-sm text-rose-600">بارگذاری لاگ ممیزی ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>منبع</TableHead>
                <TableHead>عملیات</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>جزئیات</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-stone-500">
                    رویدادی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((log) => (
                  <TableRow key={`${log.source}-${log.id}`}>
                    <TableCell>
                      <Badge className="border border-border bg-nude-50 text-stone-700">
                        {SOURCE_LABELS[log.source] ?? log.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell>{log.actor?.email ?? '—'}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-stone-500">
                      {log.context ? JSON.stringify(log.context) : '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-stone-600">
                      {new Date(log.createdAt).toLocaleString('fa-IR')}
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
