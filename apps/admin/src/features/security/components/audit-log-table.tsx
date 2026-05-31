'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
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
import { fetchAuditLogs } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PageHeader } from '@/widgets/admin/page-header';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

export function AuditLogTable() {
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.audit(page, source),
    queryFn: () => fetchAuditLogs({ source: source || undefined, page }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="لاگ ممیزی" description="GET /admin/audit-logs" availability="live" />
      <FilterBar>
        <div>
          <Label>منبع</Label>
          <select
            className="mt-1 h-11 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 text-sm"
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="platform">پلتفرم</option>
            <option value="wallet">کیف پول</option>
            <option value="trade">معاملات</option>
          </select>
        </div>
      </FilterBar>
      <Card className="overflow-hidden border-zinc-800 bg-zinc-900/40 p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>منبع</TableHead>
                <TableHead>عملیات</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((log) => (
                <TableRow key={`${log.source}-${log.id}`}>
                  <TableCell>
                    <Badge>{log.source}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.action}</TableCell>
                  <TableCell>{log.actor?.email ?? '—'}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(log.createdAt).toLocaleString('fa-IR')}
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
  );
}
