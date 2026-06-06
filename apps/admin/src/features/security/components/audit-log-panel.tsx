'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@talashim/ui';
import type { AdminAuditLog } from '@/features/admin/model/types';
import { fetchAuditLogs } from '@/features/admin/api/admin-api';
import { usePlatformSettingsLoader } from '@/features/settings/hooks/use-platform-settings-loader';
import { usePlatformSettingsStore } from '@/features/settings/model/settings-store';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { Label } from '@talashim/ui';
import { SecurityPageShell } from './security-page-shell';
import { LoginHistoryContent } from './login-history-panel';
import { SOURCE_LABELS, selectFieldClass } from '../lib/labels';

type AuditTab = 'operations' | 'auth';

const tabClass = (active: boolean) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition ${
    active
      ? 'bg-stone-900 text-white shadow-sm'
      : 'bg-white text-stone-600 ring-1 ring-border hover:bg-nude-50'
  }`;

function downloadAuditCsv(items: AdminAuditLog[]) {
  const header = ['منبع', 'عملیات', 'کاربر', 'جزئیات', 'زمان'];
  const rows = items.map((log) => [
    log.source,
    log.action,
    log.actor?.email ?? '',
    log.context ? JSON.stringify(log.context) : '',
    log.createdAt,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function AuditOperationsContent() {
  usePlatformSettingsLoader();
  const auditExportEnabled = usePlatformSettingsStore(
    (s) => s.featureFlags.enableAdminAuditExport,
  );
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.audit(page, source),
    queryFn: () => fetchAuditLogs({ source: source || undefined, page }),
  });

  return (
    <>
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
        {auditExportEnabled && data?.items.length ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadAuditCsv(data.items)}
          >
            خروجی CSV
          </Button>
        ) : null}
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
                      {formatPersianDateTime(log.createdAt)}
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

export function AuditLogPanel() {
  const [tab, setTab] = useState<AuditTab>('operations');

  return (
    <SecurityPageShell routeId="security.audit">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={tabClass(tab === 'operations')}
          onClick={() => setTab('operations')}
        >
          عملیات سیستم
        </button>
        <button
          type="button"
          className={tabClass(tab === 'auth')}
          onClick={() => setTab('auth')}
        >
          تاریخچه ورود
        </button>
      </div>

      {tab === 'operations' ? <AuditOperationsContent /> : <LoginHistoryContent />}
    </SecurityPageShell>
  );
}
