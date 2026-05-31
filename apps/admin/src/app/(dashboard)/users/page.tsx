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
} from '@sadafgold/ui';
import { fetchUsers, updateUserRole } from '@/features/admin/api/admin-api';
import { FilterBar } from '@/widgets/admin/filter-bar';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, role],
    queryFn: () => fetchUsers({ page, search: search || undefined, role: role || undefined }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, nextRole }: { userId: string; nextRole: 'CUSTOMER' | 'ADMIN' }) =>
      updateUserRole(userId, nextRole),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
      <FilterBar>
        <div className="min-w-[200px] flex-1">
          <Label>جستجو</Label>
          <Input className="mt-1" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <Label>نقش (RBAC)</Label>
          <select
            className="mt-1 h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">همه</option>
            <option value="CUSTOMER">مشتری</option>
            <option value="ADMIN">ادمین</option>
          </select>
        </div>
        <Button variant="secondary" onClick={() => setPage(1)}>
          اعمال فیلتر
        </Button>
      </FilterBar>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>ایمیل</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge>
                      {user.role.toUpperCase() === 'ADMIN' ? 'ادمین' : 'مشتری'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.kycVerification?.status ?? '—'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="!px-3 !py-1.5 text-xs"
                      disabled={roleMutation.isPending}
                      onClick={() =>
                        roleMutation.mutate({
                          userId: user.id,
                          nextRole:
                            user.role.toUpperCase() === 'ADMIN' ? 'CUSTOMER' : 'ADMIN',
                        })
                      }
                    >
                      تغییر نقش
                    </Button>
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
