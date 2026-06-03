'use client';

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
import { fetchNotificationDeliveries } from '../api/notifications-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { AdminSubnavLinks } from '@/features/admin/components/admin-subnav-links';
import { NotificationsPageShell } from './notifications-page-shell';
import { DELIVERY_STATUS_FA, NOTIFICATION_CHANNEL_FA, selectFieldClass } from '../lib/labels';

const statusClass: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-900',
  SENT: 'bg-blue-50 text-blue-800',
  DELIVERED: 'bg-emerald-50 text-emerald-800',
  FAILED: 'bg-rose-50 text-rose-800',
};

export function DeliveryPanel() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.notifications.delivery(page, status, channel, search),
    queryFn: () =>
      fetchNotificationDeliveries({
        page,
        status: status || undefined,
        channel: channel || undefined,
        search: search || undefined,
      }),
  });

  return (
    <NotificationsPageShell routeId="notifications.delivery">
      <AdminSubnavLinks
        links={[
          { href: '/notifications', label: 'صندوق ورودی' },
          { href: '/notifications/templates', label: 'قالب‌ها' },
          { href: '/notifications/rules', label: 'قوانین' },
          { href: '/notifications/delivery', label: 'لاگ ارسال' },
        ]}
      />
      {data?.summary.byStatus.length ? (
        <div className="flex flex-wrap gap-3">
          {data.summary.byStatus.map((row) => (
            <Card key={row.status} className="border-border bg-white px-4 py-3">
              <p className="text-xs text-stone-500">{DELIVERY_STATUS_FA[row.status] ?? row.status}</p>
              <p className="text-xl font-semibold">{row.count}</p>
            </Card>
          ))}
        </div>
      ) : null}

      <FilterBar>
        <div className="min-w-[180px] flex-1">
          <Label>جستجو گیرنده</Label>
          <Input className="mt-1" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div>
          <Label>وضعیت</Label>
          <select className={selectFieldClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">همه</option>
            {Object.entries(DELIVERY_STATUS_FA).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>کانال</Label>
          <select className={selectFieldClass} value={channel} onChange={(e) => { setChannel(e.target.value); setPage(1); }}>
            <option value="">همه</option>
            {Object.entries(NOTIFICATION_CHANNEL_FA).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-border bg-white p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-600">بارگذاری لاگ تحویل ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>زمان</TableHead>
                <TableHead>گیرنده</TableHead>
                <TableHead>کانال</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>قالب / قانون</TableHead>
                <TableHead>خطا</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-stone-500">
                    رکوردی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-xs text-stone-500">
                      {new Date(row.createdAt).toLocaleString('fa-IR')}
                    </TableCell>
                    <TableCell className="font-mono text-xs" dir="ltr">
                      {row.recipient}
                    </TableCell>
                    <TableCell>{NOTIFICATION_CHANNEL_FA[row.channel] ?? row.channel}</TableCell>
                    <TableCell>
                      <Badge className={statusClass[row.status]}>{DELIVERY_STATUS_FA[row.status] ?? row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-600">
                      {row.templateName ?? '—'} / {row.ruleName ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-xs text-rose-600">
                      {row.errorMessage ?? '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {data ? (
        <PaginationBar page={data.page} total={data.total} limit={data.limit} onPageChange={setPage} />
      ) : null}
    </NotificationsPageShell>
  );
}
