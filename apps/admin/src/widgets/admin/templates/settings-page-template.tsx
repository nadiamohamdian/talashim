'use client';

import type { ReactNode } from 'react';
import type { AdminRouteDefinition } from '@/shared/config/admin-routes';
import { AdminPageTemplate } from './admin-page-template';
import { PlaceholderPanel } from './placeholder-panel';

interface SettingsPageTemplateProps {
  route: AdminRouteDefinition;
  children?: ReactNode;
}

export function SettingsPageTemplate({ route, children }: SettingsPageTemplateProps) {
  return (
    <AdminPageTemplate route={route}>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="card-luxury hidden p-3 lg:block">
          <ul className="space-y-1 text-sm text-stone-500">
            {['عمومی', 'پیشرفته', 'امنیت'].map((item) => (
              <li
                key={item}
                className="rounded-lg px-3 py-2 first:bg-amber-50 first:font-medium first:text-amber-900"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>{children ?? <PlaceholderPanel template="settings" moduleLabel={route.label} />}</div>
      </div>
    </AdminPageTemplate>
  );
}
