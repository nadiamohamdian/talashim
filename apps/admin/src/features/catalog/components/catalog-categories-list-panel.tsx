'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { deleteAdminCatalogCategory, fetchAdminCatalogCategories } from '../api/catalog-categories-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';
import { CatalogPageShell } from '@/features/commerce/components/catalog-page-shell';

export function CatalogCategoriesListPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'catalog-categories'],
    queryFn: fetchAdminCatalogCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCatalogCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'catalog-categories'] }),
  });

  return (
    <CatalogPageShell
      routeId="catalog.categories.list"
      actions={
        <Link href="/catalog/categories/new">
          <Button className="h-10 px-4">دسته‌بندی جدید</Button>
        </Link>
      }
    >
      <Card className="overflow-hidden border-zinc-200">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">عنوان</TableHead>
                <TableHead className="text-right">شناسه</TableHead>
                <TableHead className="text-right">بنرها</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.title}</TableCell>
                  <TableCell dir="ltr" className="text-left">
                    {category.slug}
                  </TableCell>
                  <TableCell>{category.heroImageUrls.length}</TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/catalog/categories/${category.id}/edit`}>
                        <Button type="button" variant="outline" size="sm">
                          ویرایش
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`حذف «${category.title}»؟`)) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </CatalogPageShell>
  );
}
