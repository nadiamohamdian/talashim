'use client';

import type { ReactNode } from 'react';
import type { AdminRouteDefinition } from '@/shared/config/admin-routes';
import { AdminPageTemplate } from './admin-page-template';
import { PlaceholderPanel } from './placeholder-panel';

interface DetailPageTemplateProps {
  route: AdminRouteDefinition;
  children?: ReactNode;
  actions?: ReactNode;
}

export function DetailPageTemplate({ route, children, actions }: DetailPageTemplateProps) {
  return (
    <AdminPageTemplate route={route} actions={actions}>
      <div className="admin-subnav">
        {['عمومی', 'قیمت', 'موجودی', 'رسانه', 'SEO'].map((tab, index) => (
          <span
            key={tab}
            data-active={index === 0}
            className="admin-subnav-link shrink-0 cursor-default"
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {children ?? <PlaceholderPanel template="detail" moduleLabel={route.label} />}
        </div>
        <div className="card-luxury p-5">
          <p className="text-overline">اطلاعات جانبی</p>
          <div className="mt-4 space-y-3">
            <div className="h-8 rounded-[var(--radius-md)] bg-[var(--surface)]" />
            <div className="h-8 rounded-[var(--radius-md)] bg-[var(--surface)]" />
            <div className="h-8 rounded-[var(--radius-md)] bg-[var(--surface)]" />
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
