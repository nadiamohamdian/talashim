'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@talashim/ui';
import { fetchPermissionRegistry } from '@/features/admin/api/admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { SecurityPageShell } from './security-page-shell';

export function PermissionsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.permissions,
    queryFn: fetchPermissionRegistry,
  });

  return (
    <SecurityPageShell routeId="security.permissions">
      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : isError || !data ? (
        <p className="text-sm text-rose-600">بارگذاری مجوزها ناموفق بود.</p>
      ) : (
        <div className="space-y-6">
          <div className="card-luxury overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-nude-50 text-xs text-stone-500">
                  <th className="px-4 py-3 text-right font-medium">مجوز</th>
                  {data.roles.map((role) => (
                    <th key={role.slug} className="px-3 py-3 text-center font-medium">
                      {role.labelFa}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.permissions.map((permission) => (
                  <tr key={permission} className="border-b border-border/80 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-stone-600" dir="ltr">
                      {permission}
                    </td>
                    {data.roles.map((role) => {
                      const allowed = role.permissions.includes(permission);
                      return (
                        <td key={`${role.slug}-${permission}`} className="px-3 py-2.5 text-center">
                          <span
                            className={
                              allowed
                                ? 'text-emerald-600'
                                : 'text-stone-300'
                            }
                            aria-label={allowed ? 'مجاز' : 'غیرمجاز'}
                          >
                            {allowed ? '✓' : '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.roles.map((role) => (
              <article key={role.slug} className="card-luxury p-5">
                <h2 className="font-semibold text-stone-900">{role.labelFa}</h2>
                <p className="mt-2 text-sm text-stone-600">{role.descriptionFa}</p>
                <p className="mt-3 text-xs text-muted">{role.permissions.length} مجوز فعال</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </SecurityPageShell>
  );
}
