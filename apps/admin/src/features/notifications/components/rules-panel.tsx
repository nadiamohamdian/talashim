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
  createNotificationRule,
  deleteNotificationRule,
  fetchNotificationRules,
  fetchNotificationTemplates,
  updateNotificationRule,
} from '../api/notifications-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { AdminSubnavLinks } from '@/features/admin/components/admin-subnav-links';
import { NotificationsPageShell } from './notifications-page-shell';
import { NOTIFICATION_CHANNEL_FA, RULE_TRIGGER_FA, selectFieldClass } from '../lib/labels';

const emptyForm = {
  name: '',
  trigger: 'ORDER_PAID',
  templateId: '',
  channel: 'SMS',
  isEnabled: true,
};

export function RulesPanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const templatesQuery = useQuery({
    queryKey: ['admin', 'notifications', 'templates', 'all'],
    queryFn: () => fetchNotificationTemplates({ page: 1, limit: 100 }),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.notifications.rules(page, search),
    queryFn: () => fetchNotificationRules({ page, search: search || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId ? updateNotificationRule(editingId, form) : createNotificationRule(form),
    onSuccess: () => {
      setForm(emptyForm);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'rules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotificationRule,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'rules'] }),
  });

  return (
    <NotificationsPageShell routeId="notifications.rules">
      <AdminSubnavLinks
        links={[
          { href: '/notifications', label: 'صندوق ورودی' },
          { href: '/notifications/templates', label: 'قالب‌ها' },
          { href: '/notifications/rules', label: 'قوانین' },
          { href: '/notifications/delivery', label: 'لاگ ارسال' },
        ]}
      />
      <Card className="border-[var(--border-subtle)] bg-[var(--card)] p-6">
        <h3 className="font-medium">{editingId ? 'ویرایش قانون' : 'قانون جدید'}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <Label>نام</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>رویداد</Label>
            <select className={selectFieldClass} value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
              {Object.entries(RULE_TRIGGER_FA).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>قالب</Label>
            <select className={selectFieldClass} value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })}>
              <option value="">انتخاب قالب</option>
              {templatesQuery.data?.items.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>کانال</Label>
            <select className={selectFieldClass} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {Object.entries(NOTIFICATION_CHANNEL_FA).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isEnabled} onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })} />
            فعال
          </label>
        </div>
        <Button className="mt-4 h-9 px-3 text-xs" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          {editingId ? 'ذخیره' : 'ایجاد'}
        </Button>
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
          <p className="p-6 text-[var(--error)]">بارگذاری قوانین ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>رویداد</TableHead>
                <TableHead>قالب</TableHead>
                <TableHead>کانال</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{RULE_TRIGGER_FA[row.trigger] ?? row.trigger}</TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">{row.templateName}</TableCell>
                  <TableCell>{NOTIFICATION_CHANNEL_FA[row.channel] ?? row.channel}</TableCell>
                  <TableCell>
                    <Badge className={row.isEnabled ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--surface)]'}>
                      {row.isEnabled ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 space-x-reverse">
                    <button type="button" className="text-xs text-gold-dark" onClick={() => { setEditingId(row.id); setForm({ name: row.name, trigger: row.trigger, templateId: row.templateId, channel: row.channel, isEnabled: row.isEnabled }); }}>
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
