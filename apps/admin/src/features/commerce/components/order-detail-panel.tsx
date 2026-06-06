'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from '@talashim/ui';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import {
  fetchAdminOrder,
  updateAdminOrderStatus,
  approveAdminPaymentReceipt,
  rejectAdminPaymentReceipt,
} from '../api/commerce-api';
import { CommercePageShell } from './commerce-page-shell';
import { PermissionGate } from '@/features/auth/components/permission-gate';
import { ReceiptPreview, downloadReceipt, receiptFilenameFromUrl } from '@/shared/ui/receipt-preview';
import { formatToman, ORDER_STATUS_FA, PAYMENT_STATUS_FA, selectFieldClass } from '../lib/labels';

interface OrderDetailPanelProps {
  orderId: string;
}

export function OrderDetailPanel({ orderId }: OrderDetailPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState('');
  const [statusSaved, setStatusSaved] = useState(false);
  const [receiptActionMessage, setReceiptActionMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'commerce', 'order', orderId],
    queryFn: () => fetchAdminOrder(orderId),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateAdminOrderStatus(orderId, status),
    onSuccess: (updated) => {
      setNextStatus(updated.status);
      setStatusSaved(true);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'order', orderId] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'orders'] });
    },
  });

  const approveReceiptMutation = useMutation({
    mutationFn: (paymentId: string) => approveAdminPaymentReceipt(orderId, paymentId),
    onSuccess: () => {
      setReceiptActionMessage('فیش تأیید شد و سفارش به وضعیت «تأیید شده» تغییر کرد.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'order', orderId] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'orders'] });
    },
  });

  const rejectReceiptMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      rejectAdminPaymentReceipt(orderId, paymentId, reason),
    onSuccess: () => {
      setReceiptActionMessage('فیش رد شد. مشتری می‌تواند فیش جدید ارسال کند.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'commerce', 'order', orderId] });
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
                  {formatPersianDateTime(data.createdAt)}
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

            <PermissionGate permission={ADMIN_PERMISSIONS.orders.write}>
              <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-border pt-4">
                <div>
                  <Label>تغییر وضعیت سفارش</Label>
                  <select
                    className={selectFieldClass}
                    value={nextStatus || data.status}
                    onChange={(e) => {
                      setNextStatus(e.target.value);
                      setStatusSaved(false);
                    }}
                  >
                    {Object.entries(ORDER_STATUS_FA).map(([k, l]) => (
                      <option key={k} value={k}>{l}</option>
                    ))}
                  </select>
                </div>
                <Button
                  className="h-10 px-4"
                  disabled={!nextStatus || nextStatus === data.status || statusMutation.isPending}
                  onClick={() => statusMutation.mutate(nextStatus || data.status)}
                >
                  {statusMutation.isPending ? 'در حال اعمال...' : 'اعمال وضعیت'}
                </Button>
                {statusSaved ? (
                  <Button
                    className="btn-gold h-10 px-5"
                    onClick={() => router.push('/orders')}
                  >
                    ثبت نهایی و بازگشت به لیست
                  </Button>
                ) : null}
              </div>
            </PermissionGate>
            {statusSaved ? (
              <p className="mt-2 text-sm text-emerald-700">
                وضعیت سفارش ذخیره شد. برای اتمام، «ثبت نهایی و بازگشت به لیست» را بزنید.
              </p>
            ) : null}
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
            <h3 className="font-medium">پرداخت‌ها و فیش واریز</h3>
            {receiptActionMessage ? (
              <p className="mt-2 text-sm text-emerald-700">{receiptActionMessage}</p>
            ) : null}
            <ul className="mt-3 space-y-4 text-sm">
              {data.payments.length === 0 ? (
                <li className="text-stone-500">پرداختی ثبت نشده.</li>
              ) : (
                data.payments.map((p) => (
                  <li key={p.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        {p.provider}
                        {p.reference ? ` — ${p.reference}` : ''}
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge>{PAYMENT_STATUS_FA[p.status] ?? p.status}</Badge>
                        <span>{formatToman(p.amountToman)} تومان</span>
                      </span>
                    </div>
                    {p.receiptUrl ? (
                      <div className="mt-3">
                        <p className="text-xs text-stone-500">فیش واریز</p>
                        <ReceiptPreview url={p.receiptUrl} />
                        <div className="mt-2 flex flex-wrap gap-3">
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-amber-800 underline"
                          >
                            باز کردن در تب جدید
                          </a>
                          <button
                            type="button"
                            className="text-sm text-amber-800 underline"
                            onClick={() =>
                              downloadReceipt(
                                p.receiptUrl!,
                                receiptFilenameFromUrl(p.receiptUrl!, `receipt-${data.orderNumber}`),
                              )
                            }
                          >
                            دانلود فیش
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-stone-500">فیشی بارگذاری نشده.</p>
                    )}
                    {p.rejectionReason ? (
                      <p className="mt-2 text-xs text-rose-600">دلیل رد: {p.rejectionReason}</p>
                    ) : null}
                    {p.status === 'RECEIPT_SUBMITTED' ? (
                      <PermissionGate permission={ADMIN_PERMISSIONS.orders.write}>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            className="h-9 px-3 text-xs"
                            disabled={approveReceiptMutation.isPending}
                            onClick={() => approveReceiptMutation.mutate(p.id)}
                          >
                            تأیید فیش و نهایی‌سازی سفارش
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 px-3 text-xs"
                            disabled={rejectReceiptMutation.isPending}
                            onClick={() => {
                              const reason = window.prompt('دلیل رد فیش:');
                              if (reason?.trim()) {
                                rejectReceiptMutation.mutate({ paymentId: p.id, reason: reason.trim() });
                              }
                            }}
                          >
                            رد فیش
                          </Button>
                        </div>
                      </PermissionGate>
                    ) : null}
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
