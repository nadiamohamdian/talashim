'use client';

import type { ReactNode } from 'react';
import type { AdminRouteDefinition } from '@/shared/config/admin-routes';
import { FilterBar } from '../filter-bar';
import { AdminPageTemplate } from './admin-page-template';
import { PlaceholderPanel } from './placeholder-panel';

interface ListPageTemplateProps {
  route: AdminRouteDefinition;
  children?: ReactNode;
  actions?: ReactNode;
}

export function ListPageTemplate({ route, children, actions }: ListPageTemplateProps) {
  return (
    <AdminPageTemplate route={route} actions={actions}>
      <FilterBar>
        <div
          className="h-10 min-w-[140px] flex-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--input-bg)]"
          aria-hidden
        />
        <div className="h-10 w-32 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" aria-hidden />
        <div className="h-10 w-24 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]" aria-hidden />
      </FilterBar>
      {children ?? <PlaceholderPanel template="list" moduleLabel={route.label} />}
    </AdminPageTemplate>
  );
}
