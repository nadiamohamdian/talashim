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
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="card-luxury hidden p-2 lg:block">
          <ul className="space-y-0.5 text-sm">
            {['عمومی', 'پیشرفته', 'امنیت'].map((item, index) => (
              <li
                key={item}
                className={`rounded-[var(--radius-md)] px-3 py-2.5 transition ${
                  index === 0
                    ? 'bg-[var(--sidebar-active)] font-medium text-foreground'
                    : 'text-muted hover:bg-[var(--surface)] hover:text-foreground'
                }`}
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
