'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sadafgold/ui';
import { fetchTradeOrders, fetchWalletTransactions } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PageHeader } from '@/widgets/admin/page-header';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

export function TransactionsPanel() {
  const [walletType, setWalletType] = useState('');
  const [tradeSide, setTradeSide] = useState('');
  const [walletPage, setWalletPage] = useState(1);
  const [tradePage, setTradePage] = useState(1);

  const walletQuery = useQuery({
    queryKey: adminQueryKeys.walletTx(walletPage, walletType),
    queryFn: () => fetchWalletTransactions({ type: walletType || undefined, page: walletPage }),
  });

  const tradeQuery = useQuery({
    queryKey: adminQueryKeys.trades(tradePage, tradeSide),
    queryFn: () => fetchTradeOrders({ side: tradeSide || undefined, page: tradePage }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="تراکنش‌ها"
        description="کیف پول و معاملات — /admin/transactions/*"
        availability="live"
      />
      <Tabs defaultValue="wallet">
        <TabsList>
          <TabsTrigger value="wallet">کیف پول</TabsTrigger>
          <TabsTrigger value="trades">معاملات طلا</TabsTrigger>
        </TabsList>
        <TabsContent value="wallet">
          <FilterBar>
            <div>
              <Label>نوع</Label>
              <select
                className="mt-1 h-11 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 text-sm"
                value={walletType}
                onChange={(e) => {
                  setWalletType(e.target.value);
                  setWalletPage(1);
                }}
              >
                <option value="">همه</option>
                <option value="DEPOSIT">واریز</option>
                <option value="TRADE_BUY">خرید</option>
                <option value="TRADE_SELL">فروش</option>
                <option value="TRANSFER">انتقال</option>
              </select>
            </div>
          </FilterBar>
          <Card className="mt-4 overflow-hidden border-zinc-800 bg-zinc-900/40 p-0">
            {walletQuery.isLoading ? (
              <Skeleton className="m-6 h-64" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>مرجع</TableHead>
                    <TableHead>کاربر</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>زمان</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletQuery.data?.items.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                      <TableCell>{tx.user?.fullName ?? '—'}</TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell>{tx.status}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(tx.createdAt).toLocaleString('fa-IR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
          {walletQuery.data ? (
            <PaginationBar
              page={walletQuery.data.page}
              total={walletQuery.data.total}
              limit={walletQuery.data.limit}
              onPageChange={setWalletPage}
            />
          ) : null}
        </TabsContent>
        <TabsContent value="trades">
          <FilterBar>
            <div>
              <Label>سمت</Label>
              <select
                className="mt-1 h-11 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 text-sm"
                value={tradeSide}
                onChange={(e) => {
                  setTradeSide(e.target.value);
                  setTradePage(1);
                }}
              >
                <option value="">همه</option>
                <option value="BUY">خرید</option>
                <option value="SELL">فروش</option>
              </select>
            </div>
          </FilterBar>
          <Card className="mt-4 overflow-hidden border-zinc-800 bg-zinc-900/40 p-0">
            {tradeQuery.isLoading ? (
              <Skeleton className="m-6 h-64" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره</TableHead>
                    <TableHead>کاربر</TableHead>
                    <TableHead>سمت</TableHead>
                    <TableHead>مقدار</TableHead>
                    <TableHead>مبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradeQuery.data?.items.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                      <TableCell>{order.user.fullName}</TableCell>
                      <TableCell>{order.side}</TableCell>
                      <TableCell>{order.quantityGram} گرم</TableCell>
                      <TableCell>{Number(order.netRial).toLocaleString('fa-IR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
          {tradeQuery.data ? (
            <PaginationBar
              page={tradeQuery.data.page}
              total={tradeQuery.data.total}
              limit={tradeQuery.data.limit}
              onPageChange={setTradePage}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
