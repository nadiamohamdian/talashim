'use client';

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
import { fetchKyc, reviewKyc } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PageHeader } from '@/widgets/admin/page-header';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

export function KycManagement() {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: adminQueryKeys.kyc(page, status),
    queryFn: () => fetchKyc({ page, status: status || undefined }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'APPROVED' | 'REJECTED' }) =>
      reviewKyc(id, { status: next }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="احراز هویت (KYC)"
        description="GET /admin/kyc · PATCH /admin/kyc/:id/review"
        availability="live"
      />
      <FilterBar>
        <div>
          <Label>وضعیت</Label>
          <select
            className="mt-1 h-11 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="PENDING">در انتظار</option>
            <option value="APPROVED">تأیید شده</option>
            <option value="REJECTED">رد شده</option>
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
                <TableHead>کاربر</TableHead>
                <TableHead>کد ملی</TableHead>
                <TableHead>موبایل</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.user.fullName}</TableCell>
                  <TableCell className="font-mono text-xs">{item.nationalId}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>
                    <Badge>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2 space-x-reverse">
                    {item.status === 'PENDING' ? (
                      <>
                        <Button
                          variant="buy"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => reviewMutation.mutate({ id: item.id, next: 'APPROVED' })}
                        >
                          تأیید
                        </Button>
                        <Button
                          variant="sell"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => reviewMutation.mutate({ id: item.id, next: 'REJECTED' })}
                        >
                          رد
                        </Button>
                      </>
                    ) : (
                      '—'
                    )}
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
