'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'products.list': 'مدیریت کاتالوگ طلا و جواهر — SKU، قیمت و موجودی.',
  'products.new': 'ثبت محصول جدید با موجودی اولیه.',
  'products.detail': 'جزئیات محصول، قیمت لحظه‌ای و موجودی.',
  'products.edit': 'ویرایش مشخصات و تصویر محصول.',
  'products.videos': 'ویدیوهای معرفی محصولات.',
  'products.reviews': 'بررسی، تأیید یا رد دیدگاه‌های ثبت‌شده توسط مشتریان.',
  'catalog.categories.list': 'مدیریت صفحات لیست محصولات، بنرهای چندتایی و فیلترهای هر دسته.',
  'catalog.categories.new': 'ایجاد صفحه دسته‌بندی جدید با فیلترها و گالری بنر.',
  'catalog.categories.edit': 'ویرایش عنوان، بنرها و فیلترهای صفحه دسته‌بندی.',
  'inventory.overview': 'موجودی فیزیکی و رزرو هر SKU.',
  'inventory.history': 'تاریخچه تغییرات موجودی (ثبت‌شده در دفتر حرکت).',
  'inventory.reports': 'گزارش کم‌موجودی و توزیع دسته‌ها.',
};

interface CatalogPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function CatalogPageShell({ routeId, children, actions }: CatalogPageShellProps) {
  const route = ADMIN_ROUTE_BY_ID[routeId];
  if (!route) {
    notFound();
  }

  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="space-y-6">
        <PageHeader
          title={route.label}
          description={DESCRIPTIONS[routeId]}
          availability={route.availability}
          actions={actions}
        />
        {children}
      </div>
    </RoutePermissionGuard>
  );
}
