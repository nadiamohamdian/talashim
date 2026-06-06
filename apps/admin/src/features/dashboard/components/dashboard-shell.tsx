'use client';

import type { AdminRouteDefinition } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { StatCard } from '@/widgets/admin/stat-card';
import { PageHeader } from '@/widgets/admin/page-header';

interface DashboardShellProps {
  route: AdminRouteDefinition;
}

const KPI_PLACEHOLDERS = [
  { label: 'درآمد', hint: 'ماژول گزارش' },
  { label: 'سفارش‌ها', hint: 'ماژول سفارش' },
  { label: 'کاربران', hint: 'ماژول کاربران' },
  { label: 'قیمت طلا', hint: 'ماژول قیمت' },
] as const;

export function DashboardShell({ route }: DashboardShellProps) {
  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="space-y-8">
        <PageHeader
          title={route.label}
          description="نمای کلی پلتفرم — ویجت‌های زنده پس از اتصال API تکمیل می‌شوند."
          availability={route.availability}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_PLACEHOLDERS.map((kpi) => (
            <StatCard key={kpi.label} label={kpi.label} value="—" hint={kpi.hint} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-luxury p-6">
            <p className="text-sm font-medium text-foreground">نمودار فروش</p>
            <div className="mt-4 h-48 rounded-[var(--radius-xl)] bg-nude-100/80" />
          </div>
          <div className="card-luxury p-6">
            <p className="text-sm font-medium text-foreground">فعالیت اخیر</p>
            <ul className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="h-10 rounded-lg bg-nude-100" />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </RoutePermissionGuard>
  );
}
