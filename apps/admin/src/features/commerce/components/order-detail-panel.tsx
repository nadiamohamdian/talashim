'use client';

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
import { fetchAdminOrder, updateAdminOrderStatus } from '../api/commerce-api';
import { CommercePageShell } from './commerce-page-shell';
import { formatToman, ORDER_STATUS_FA, selectFieldClass } from '../lib/labels';

interface OrderDetailPanelProps {
  orderId: string;
}

export function OrderDetailPanel({ orderId }: OrderDetailPanelProps) {
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'commerce', 'order', orderId],
    queryFn: () => fetchAdminOrder(orderId),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateAdminOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'order', orderId] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'orders'] });
    },
  });

  return (
    <CommercePageShell
      routeId="orders.detail"
      actions={
        <Link href="/orders" className="text-sm text-stone-600 hover:text-stone-900">
          ← بازگشت به لیست
        </Link>
      }
    >
      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-2xl" />
      ) : isError || !data ? (
        <p className="text-rose-600">سفارش یافت نشد.</p>
      ) : (
        <div className="space-y-6">
          <Card className="border-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-lg">{data.orderNumber}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {data.user?.fullName ?? 'مهمان'} — {data.user?.email ?? ''}
                </p>
                <p className="mt-2 text-xs text-stone-500">
                  {new Date(data.createdAt).toLocaleString('fa-IR')}
                </p>
              </div>
              <Badge>{ORDER_STATUS_FA[data.status] ?? data.status}</Badge>
            </div>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-stone-500">جمع جزء</dt>
                <dd>{formatToman(data.subtotalToman)} تومان</dd>
              </div>
              <div>
                <dt className="text-stone-500">مالیات</dt>
                <dd>{formatToman(data.taxToman)} تومان</dd>
              </div>
              <div>
                <dt className="text-stone-500">جمع کل</dt>
                <dd className="font-semibold">{formatToman(data.totalToman)} تومان</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-border pt-4">
              <div>
                <Label>تغییر وضعیت</Label>
                <select
                  className={selectFieldClass}
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                >
                  <option value="">انتخاب کنید</option>
                  {Object.entries(ORDER_STATUS_FA).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="h-10 px-4"
                disabled={!nextStatus || statusMutation.isPending}
                onClick={() => statusMutation.mutate(nextStatus)}
              >
                اعمال
              </Button>
            </div>
            {statusMutation.isError ? (
              <p className="mt-2 text-sm text-rose-600">تغییر وضعیت مجاز نیست یا ناموفق بود.</p>
            ) : null}
          </Card>

          <Card className="overflow-hidden border-border bg-white p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>محصول</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>تعداد</TableHead>
                  <TableHead>قیمت واحد</TableHead>
                  <TableHead>جمع خط</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productTitle}</TableCell>
                    <TableCell className="font-mono text-xs">{item.productSku}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatToman(item.unitPriceToman)}</TableCell>
                    <TableCell>{formatToman(item.lineTotalToman)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="border-border bg-white p-6">
            <h3 className="font-medium">پرداخت‌ها</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {data.payments.length === 0 ? (
                <li className="text-stone-500">پرداختی ثبت نشده.</li>
              ) : (
                data.payments.map((p) => (
                  <li key={p.id} className="flex justify-between border-b border-border py-2">
                    <span>
                      {p.provider} — {p.status}
                    </span>
                    <span>{formatToman(p.amountToman)} تومان</span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      )}
    </CommercePageShell>
  );
}
