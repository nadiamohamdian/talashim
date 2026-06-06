'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
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
import {
  createNotificationTemplate,
  deleteNotificationTemplate,
  fetchNotificationTemplates,
  updateNotificationTemplate,
} from '../api/notifications-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { AdminSubnavLinks } from '@/features/admin/components/admin-subnav-links';
import { NotificationsPageShell } from './notifications-page-shell';
import { NOTIFICATION_CHANNEL_FA, selectFieldClass } from '../lib/labels';

const emptyForm = {
  key: '',
  name: '',
  channel: 'SMS',
  subject: '',
  body: '',
  isActive: true,
};

export function TemplatesPanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.notifications.templates(page, search),
    queryFn: () => fetchNotificationTemplates({ page, search: search || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId
        ? updateNotificationTemplate(editingId, form)
        : createNotificationTemplate(form),
    onSuccess: () => {
      setForm(emptyForm);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotificationTemplate,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] }),
  });

  return (
    <NotificationsPageShell routeId="notifications.templates">
      <AdminSubnavLinks
        links={[
          { href: '/notifications', label: 'صندوق ورودی' },
          { href: '/notifications/templates', label: 'قالب‌ها' },
          { href: '/notifications/rules', label: 'قوانین' },
          { href: '/notifications/delivery', label: 'لاگ ارسال' },
        ]}
      />
      <Card className="border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h3 className="font-medium">{editingId ? 'ویرایش قالب' : 'قالب جدید'}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <Label>کلید یکتا</Label>
            <Input className="mt-1" value={form.key} disabled={Boolean(editingId)} onChange={(e) => setForm({ ...form, key: e.target.value })} />
          </div>
          <div>
            <Label>نام</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>کانال</Label>
            <select className={selectFieldClass} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {Object.entries(NOTIFICATION_CHANNEL_FA).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>موضوع (ایمیل)</Label>
            <Input className="mt-1" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>متن (از {'{{'}var{'}}'} استفاده کنید)</Label>
            <textarea className="mt-1 min-h-[100px] w-full rounded-[var(--radius-xl)] border border-border px-3 py-2 text-sm" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="h-9 px-3 text-xs" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {editingId ? 'ذخیره' : 'ایجاد'}
          </Button>
          {editingId ? (
            <Button variant="ghost" className="h-9 px-3 text-xs" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              انصراف
            </Button>
          ) : null}
        </div>
      </Card>

      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input className="mt-1" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </FilterBar>

      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-48" />
        ) : isError ? (
          <p className="p-6 text-[var(--error)]">بارگذاری قالب‌ها ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کلید</TableHead>
                <TableHead>نام</TableHead>
                <TableHead>کانال</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.key}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{NOTIFICATION_CHANNEL_FA[row.channel] ?? row.channel}</TableCell>
                  <TableCell>
                    <Badge className={row.isActive ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--surface)]'}>
                      {row.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 space-x-reverse">
                    <button type="button" className="text-xs text-gold-dark" onClick={() => { setEditingId(row.id); setForm({ key: row.key, name: row.name, channel: row.channel, subject: row.subject ?? '', body: row.body, isActive: row.isActive }); }}>
                      ویرایش
                    </button>
                    <button type="button" className="text-xs text-[var(--error)]" onClick={() => deleteMutation.mutate(row.id)}>
                      حذف
                    </button>
                  </TableCell>
                </TableRow>
              ))}
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
