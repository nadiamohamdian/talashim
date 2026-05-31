'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { fetchBlogPosts } from '@/lib/api/blog.api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { ApiUnavailablePanel } from '@/widgets/admin/api-unavailable-panel';
import { API_REQUIREMENTS } from '@/shared/config/api-requirements';
import { PageHeader } from '@/widgets/admin/page-header';
import { PaginationBar } from '@/widgets/admin/pagination-bar';

export function BlogPostsTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.blog(page),
    queryFn: () => fetchBlogPosts({ page, limit: 20 }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="وبلاگ"
        description="خواندن: GET /blog — ویرایش/ایجاد نیازمند admin API"
        availability="partial"
      />
      <Card className="overflow-hidden border-zinc-800 bg-zinc-900/40 p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-64" />
        ) : isError ? (
          <p className="p-6 text-rose-400">بارگذاری وبلاگ ناموفق بود.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>slug</TableHead>
                <TableHead>تاریخ انتشار</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell className="font-mono text-xs" dir="ltr">
                    {post.slug}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(post.publishedAt).toLocaleDateString('fa-IR')}
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
      <ApiUnavailablePanel
        title="مدیریت محتوای وبلاگ"
        summary={API_REQUIREMENTS.cms.summary}
        endpoints={API_REQUIREMENTS.cms.endpoints.filter((e) => e.path.includes('blog'))}
        connectedNote="لیست پست‌ها از API عمومی blog بارگذاری می‌شود."
      />
    </div>
  );
}
