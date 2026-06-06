'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useState } from 'react';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { AdminSubnavLinks } from '@/features/admin/components/admin-subnav-links';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Skeleton,
} from '@talashim/ui';
import {
  broadcastNotification,
  fetchNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { NotificationsPageShell } from './notifications-page-shell';
import {
  NOTIFICATION_CHANNEL_FA,
  NOTIFICATION_PRIORITY_FA,
  selectFieldClass,
  STAFF_ROLE_FA,
} from '../lib/labels';

export function InboxPanel() {
  const canManage = useAdminAuthStore((s) =>
    s.hasPermission(ADMIN_PERMISSIONS.notifications.manage),
  );
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [channel, setChannel] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcast, setBroadcast] = useState({ title: '', body: '', targetRole: '' });

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.notifications.inbox(page, unreadOnly, channel),
    queryFn: () =>
      fetchNotificationInbox({
        page,
        unreadOnly: unreadOnly || undefined,
        channel: channel || undefined,
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });

  const broadcastMutation = useMutation({
    mutationFn: () =>
      broadcastNotification({
        title: broadcast.title,
        body: broadcast.body,
        targetRole: broadcast.targetRole || undefined,
        channel: 'IN_APP',
      }),
    onSuccess: () => {
      setShowBroadcast(false);
      setBroadcast({ title: '', body: '', targetRole: '' });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  return (
    <NotificationsPageShell
      routeId="notifications.inbox"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 px-4"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            خواندن همه
          </Button>
          <Button className="h-10 px-4" onClick={() => setShowBroadcast((v) => !v)}>
            اعلان جدید
          </Button>
        </div>
      }
    >
      {canManage ? (
        <AdminSubnavLinks
          links={[
            { href: '/notifications', label: 'صندوق ورودی' },
            { href: '/notifications/templates', label: 'قالب‌ها' },
            { href: '/notifications/rules', label: 'قوانین' },
            { href: '/notifications/delivery', label: 'لاگ ارسال' },
          ]}
        />
      ) : null}

      {data?.summary ? (
        <div className="flex gap-4">
          <Card className="flex-1 border-border bg-white p-4">
            <p className="text-xs text-stone-500">خوانده‌نشده</p>
            <p className="text-2xl font-semibold text-amber-800">{data.summary.unreadCount}</p>
          </Card>
          <Card className="flex-1 border-border bg-white p-4">
            <p className="text-xs text-stone-500">کل اعلان‌ها</p>
            <p className="text-2xl font-semibold">{data.summary.totalCount}</p>
          </Card>
        </div>
      ) : null}

      {showBroadcast ? (
        <Card className="border-border bg-white p-4">
          <h3 className="font-medium">ارسال اعلان به تیم</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <Label>عنوان</Label>
              <Input className="mt-1" value={broadcast.title} onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })} />
            </div>
            <div>
              <Label>نقش هدف (خالی = همه)</Label>
              <select
                className={selectFieldClass}
                value={broadcast.targetRole}
                onChange={(e) => setBroadcast({ ...broadcast, targetRole: e.target.value })}
              >
                <option value="">همه نقش‌ها</option>
                {Object.entries(STAFF_ROLE_FA).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>متن</Label>
              <textarea
                className="mt-1 min-h-[80px] w-full rounded-2xl border border-border px-3 py-2 text-sm"
                value={broadcast.body}
                onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })}
              />
            </div>
          </div>
          <Button className="mt-3 h-9 px-3 text-xs" disabled={broadcastMutation.isPending} onClick={() => broadcastMutation.mutate()}>
            ارسال
          </Button>
        </Card>
      ) : null}

      <FilterBar>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }} />
          فقط خوانده‌نشده
        </label>
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

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError ? (
        <p className="text-rose-600">بارگذاری اعلان‌ها ناموفق بود.</p>
      ) : (
        <ul className="space-y-2">
          {data?.items.length === 0 ? (
            <li className="rounded-2xl border border-border bg-white p-8 text-center text-stone-500">
              اعلانی نیست.
            </li>
          ) : (
            data?.items.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border border-border bg-white p-4 ${item.readAt ? 'opacity-75' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{item.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="bg-nude-100 text-stone-700">
                        {NOTIFICATION_CHANNEL_FA[item.channel] ?? item.channel}
                      </Badge>
                      <Badge>{NOTIFICATION_PRIORITY_FA[item.priority] ?? item.priority}</Badge>
                      {item.targetRole ? (
                        <Badge className="bg-blue-50 text-blue-800">
                          {STAFF_ROLE_FA[item.targetRole] ?? item.targetRole}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-stone-500">
                      {formatPersianDateTime(item.createdAt)}
                    </p>
                    {!item.readAt ? (
                      <Button
                        variant="ghost"
                        className="mt-2 h-8 px-3 text-xs"
                        onClick={() => markReadMutation.mutate(item.id)}
                      >
                        علامت خوانده
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {data ? (
        <PaginationBar page={data.page} total={data.total} limit={data.limit} onPageChange={setPage} />
      ) : null}
    </NotificationsPageShell>
  );
}
