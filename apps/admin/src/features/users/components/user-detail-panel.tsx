'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { getRoleLabelFa } from '@sadafgold/shared/admin-rbac';
import { fetchUserActivity, fetchUserDetail } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PaginationBar } from '@/widgets/admin/pagination-bar';
import { formatToman } from '@/features/finance/lib/labels';
import { UsersPageShell } from './users-page-shell';
import { KYC_STATUS_FA } from '../lib/labels';

interface UserDetailPanelProps {
  userId: string;
}

const SOURCE_FA: Record<string, string> = {
  platform: 'سیستم',
  wallet: 'کیف پول',
  trade: 'معامله',
};

export function UserDetailPanel({ userId }: UserDetailPanelProps) {
  const [activityPage, setActivityPage] = useState(1);

  const detailQuery = useQuery({
    queryKey: adminQueryKeys.userDetail(userId),
    queryFn: () => fetchUserDetail(userId),
  });

  const activityQuery = useQuery({
    queryKey: adminQueryKeys.userActivity(userId, activityPage),
    queryFn: () => fetchUserActivity(userId, { page: activityPage }),
  });

  const data = detailQuery.data;

  return (
    <UsersPageShell
      routeId="users.detail"
      actions={
        <Link href="/users" className="text-sm text-stone-600 hover:text-stone-900">
          ← بازگشت به لیست
        </Link>
      }
    >
      {detailQuery.isLoading ? (
        <Skeleton className="h-80 w-full rounded-2xl" />
      ) : detailQuery.isError || !data ? (
        <p className="text-rose-600">کاربر یافت نشد.</p>
      ) : (
        <div className="space-y-6">
          <Card className="border-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">{data.user.fullName}</h2>
                <p className="mt-1 text-sm text-stone-600" dir="ltr">
                  {data.user.email}
                </p>
                <p className="mt-2 text-xs text-stone-500">
                  ثبت‌نام: {new Date(data.user.createdAt).toLocaleString('fa-IR')}
                </p>
              </div>
              <Badge className="bg-nude-100 text-stone-700">
                {getRoleLabelFa(String(data.user.role).toLowerCase())}
              </Badge>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-stone-500">موجودی ریال</dt>
                <dd className="mt-1 font-medium">{formatToman(data.balances.rialBalance)} ت</dd>
              </div>
              <div>
                <dt className="text-stone-500">موجودی طلا</dt>
                <dd className="mt-1 font-medium">{data.balances.goldBalanceGram} گرم</dd>
              </div>
              <div>
                <dt className="text-stone-500">سفارش / معامله</dt>
                <dd className="mt-1 font-medium">
                  {data.stats.orders.toLocaleString('fa-IR')} /{' '}
                  {data.stats.goldTrades.toLocaleString('fa-IR')}
                </dd>
              </div>
            </dl>
          </Card>

          {data.kyc ? (
            <Card className="border-border bg-white p-6">
              <h3 className="font-medium text-stone-900">احراز هویت</h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-stone-500">وضعیت</dt>
                  <dd className="mt-1">
                    <Badge className="bg-nude-100 text-stone-700">
                      {KYC_STATUS_FA[data.kyc.status] ?? data.kyc.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">کد ملی</dt>
                  <dd className="mt-1 font-mono">{data.kyc.nationalId}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">موبایل</dt>
                  <dd className="mt-1">{data.kyc.phone}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">تاریخ ارسال</dt>
                  <dd className="mt-1">
                    {new Date(data.kyc.submittedAt).toLocaleString('fa-IR')}
                  </dd>
                </div>
                {data.kyc.reviewNote ? (
                  <div className="sm:col-span-2">
                    <dt className="text-stone-500">یادداشت بررسی</dt>
                    <dd className="mt-1 text-stone-700">{data.kyc.reviewNote}</dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-white p-0">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-medium text-stone-900">سفارش‌های اخیر</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-stone-500">
                        سفارشی ثبت نشده.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                        <TableCell>{formatToman(order.totalToman)} ت</TableCell>
                        <TableCell>{order.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            <Card className="border-border bg-white p-0">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-medium text-stone-900">معاملات اخیر</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>وزن</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-stone-500">
                        معامله‌ای ثبت نشده.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-mono text-xs">{trade.orderNumber}</TableCell>
                        <TableCell>{trade.side === 'BUY' ? 'خرید' : 'فروش'}</TableCell>
                        <TableCell>{trade.quantityGram} گرم</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          <Card className="border-border bg-white p-0">
            <div className="border-b border-border px-6 py-4">
              <h3 className="font-medium text-stone-900">فعالیت اخیر</h3>
            </div>
            {activityQuery.isLoading ? (
              <Skeleton className="m-6 h-32" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>عملیات</TableHead>
                    <TableHead>منبع</TableHead>
                    <TableHead>زمان</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityQuery.data?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-stone-500">
                        فعالیتی ثبت نشده.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityQuery.data?.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.action}</TableCell>
                        <TableCell>{SOURCE_FA[item.source] ?? item.source}</TableCell>
                        <TableCell className="text-xs text-stone-500">
                          {new Date(item.createdAt).toLocaleString('fa-IR')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            {activityQuery.data ? (
              <div className="border-t border-border p-4">
                <PaginationBar
                  page={activityQuery.data.page}
                  total={activityQuery.data.total}
                  limit={activityQuery.data.limit}
                  onPageChange={setActivityPage}
                />
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </UsersPageShell>
  );
}
