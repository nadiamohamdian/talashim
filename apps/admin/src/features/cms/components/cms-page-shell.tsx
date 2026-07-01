'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { getSectionIcon } from '@/shared/lib/admin-nav-icons';
import { getSectionTheme } from '@/shared/lib/admin-section-theme';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'cms.blog': 'مدیریت مقالات، راهنماها و انتشار محتوا.',
  'cms.blog.reviews': 'بررسی، تأیید یا رد نظرات کاربران روی مقالات وبلاگ.',
  'cms.homepage': 'ویرایش هیرو و بخش‌های صفحه اصلی فروشگاه.',
  'cms.banners': 'بنرهای تبلیغاتی صفحه اصلی و دسته‌بندی‌ها.',
  'cms.lens': 'ویدیوهای بخش لنز طلاشیم در صفحه اصلی موبایل.',
  'cms.lensSets': 'تصویر هیرو، محصولات روی تصویر و پاپ‌آپ لنز در بخش «ست‌ها از نمای نزدیک».',
  'cms.faq': 'سوالات متداول نمایش‌داده‌شده در /faq.',
  'cms.seo': 'عنوان سایت، توضیحات و تنظیمات ایندکس موتورهای جستجو.',
  'cms.about': 'ویرایش متن‌ها، ارزش‌ها و تصویر صفحه درباره ما در فروشگاه.',
  'cms.pages': 'صفحات ثابت درباره ما، قوانین و سیاست‌ها.',
  'media.library': 'کتابخانه تصاویر و فایل‌های رسانه‌ای.',
  'media.upload': 'ثبت فایل جدید با آدرس URL.',
};

interface CmsPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function CmsPageShell({ routeId, children, actions }: CmsPageShellProps) {
  const route = ADMIN_ROUTE_BY_ID[routeId];
  if (!route) {
    notFound();
  }

  const SectionIcon = getSectionIcon(route.sectionId);
  const theme = getSectionTheme(route.sectionId);

  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="admin-page-stack">
        <PageHeader
          title={route.label}
          description={DESCRIPTIONS[routeId]}
          availability={route.availability}
          actions={actions}
          icon={SectionIcon}
          iconTheme={theme}
        />
        {children}
      </div>
    </RoutePermissionGuard>
  );
}
