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
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-1">
        {['عمومی', 'قیمت', 'موجودی', 'رسانه', 'SEO'].map((tab) => (
          <span
            key={tab}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-stone-500 first:bg-amber-50 first:font-medium first:text-amber-900"
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
          <p className="text-xs font-medium text-stone-500">اطلاعات جانبی</p>
          <div className="mt-4 space-y-3">
            <div className="h-8 rounded-lg bg-nude-100" />
            <div className="h-8 rounded-lg bg-nude-100" />
            <div className="h-8 rounded-lg bg-nude-100" />
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
