'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Skeleton } from '@talashim/ui';
import {
  fetchPermissionRegistry,
  updateRolePermissions,
} from '@/features/admin/api/admin-api';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { ADMIN_PERMISSIONS } from '@/shared/config/admin-permissions';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { SecurityPageShell } from './security-page-shell';

type RoleMatrix = Record<string, string[]>;

function buildMatrixFromRegistry(
  roles: Array<{ slug: string; permissions: string[] }>,
): RoleMatrix {
  return Object.fromEntries(roles.map((role) => [role.slug, [...role.permissions]]));
}

function collectChangedRoles(
  baseline: RoleMatrix,
  draft: RoleMatrix,
): Array<{ roleSlug: string; permissions: string[] }> {
  const updates: Array<{ roleSlug: string; permissions: string[] }> = [];

  for (const roleSlug of Object.keys(draft)) {
    const before = [...(baseline[roleSlug] ?? [])].sort().join('|');
    const after = [...(draft[roleSlug] ?? [])].sort().join('|');
    if (before !== after) {
      updates.push({ roleSlug, permissions: draft[roleSlug] ?? [] });
    }
  }

  return updates;
}

export interface PermissionsEditorState {
  headerActions: ReactNode;
  isLoading: boolean;
  isError: boolean;
  data: Awaited<ReturnType<typeof fetchPermissionRegistry>> | undefined;
  saveMessage: string | null;
  saveError: string | null;
  draft: RoleMatrix;
  togglePermission: (roleSlug: string, permission: string, enabled: boolean) => void;
  saveMutationPending: boolean;
  isSuperAdmin: boolean;
}

export function usePermissionsEditor(): PermissionsEditorState {
  const queryClient = useQueryClient();
  const currentRoleSlug = useAdminAuthStore((s) => s.user?.role);
  const setPermissions = useAdminAuthStore((s) => s.setPermissions);
  const isSuperAdmin = currentRoleSlug === 'super_admin';

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.permissions,
    queryFn: fetchPermissionRegistry,
  });

  const [baseline, setBaseline] = useState<RoleMatrix>({});
  const [draft, setDraft] = useState<RoleMatrix>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      return;
    }
    const matrix = buildMatrixFromRegistry(data.roles);
    setBaseline(matrix);
    setDraft(matrix);
  }, [data]);

  const dirtyUpdates = useMemo(
    () => collectChangedRoles(baseline, draft),
    [baseline, draft],
  );
  const isDirty = dirtyUpdates.length > 0;

  const saveMutation = useMutation({
    mutationFn: updateRolePermissions,
    onSuccess: (registry) => {
      const matrix = buildMatrixFromRegistry(registry.roles);
      setBaseline(matrix);
      setDraft(matrix);
      setSaveError(null);
      setSaveMessage(
        'تغییرات دسترسی با موفقیت ذخیره شد. کاربران همان نقش پس از رفرش صفحه یا ورود مجدد، منوی به‌روز را می‌بینند.',
      );
      queryClient.setQueryData(adminQueryKeys.permissions, registry);

      if (currentRoleSlug) {
        const myRole = registry.roles.find((role) => role.slug === currentRoleSlug);
        if (myRole) {
          setPermissions(myRole.permissions as AdminPermissionKey[]);
        }
      }
    },
    onError: () => {
      setSaveMessage(null);
      setSaveError('ذخیره تغییرات ناموفق بود. دوباره تلاش کنید.');
    },
  });

  const togglePermission = useCallback(
    (roleSlug: string, permission: string, enabled: boolean) => {
      if (roleSlug === 'super_admin' && !isSuperAdmin) {
        return;
      }

      if (
        roleSlug === 'super_admin' &&
        permission === ADMIN_PERMISSIONS.security.rbac &&
        !enabled
      ) {
        return;
      }

      setSaveMessage(null);
      setSaveError(null);
      setDraft((current) => {
        const rolePermissions = new Set(current[roleSlug] ?? []);
        if (enabled) {
          rolePermissions.add(permission);
        } else {
          rolePermissions.delete(permission);
        }
        return {
          ...current,
          [roleSlug]: [...rolePermissions],
        };
      });
    },
    [isSuperAdmin],
  );

  const handleReset = () => {
    setDraft(baseline);
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleSave = () => {
    if (!isDirty) {
      return;
    }
    saveMutation.mutate({ updates: dirtyUpdates });
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {isDirty ? (
        <span className="rounded-full bg-[var(--warning-bg)] px-3 py-1 text-xs text-[var(--warning)]">
          {dirtyUpdates.length} نقش تغییر کرده
        </span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        disabled={!isDirty || saveMutation.isPending}
        onClick={handleReset}
        className="px-4 py-2 text-xs"
      >
        بازنشانی
      </Button>
      <Button
        type="button"
        disabled={!isDirty || saveMutation.isPending}
        onClick={handleSave}
        className="px-4 py-2 text-xs"
      >
        {saveMutation.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
      </Button>
    </div>
  );

  return {
    headerActions,
    isLoading,
    isError,
    data,
    saveMessage,
    saveError,
    draft,
    togglePermission,
    saveMutationPending: saveMutation.isPending,
    isSuperAdmin,
  };
}

export function PermissionsMatrixContent({ editor }: { editor: PermissionsEditorState }) {
  const {
    isLoading,
    isError,
    data,
    saveMessage,
    saveError,
    draft,
    togglePermission,
    saveMutationPending,
    isSuperAdmin,
  } = editor;

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[var(--radius-xl)]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-[var(--error)]">بارگذاری مجوزها ناموفق بود.</p>;
  }

  return (
    <div className="space-y-6">
      {saveMessage ? <Alert variant="success">{saveMessage}</Alert> : null}
      {saveError ? <Alert variant="destructive">{saveError}</Alert> : null}

      <p className="text-sm text-[var(--muted-foreground)]">
        برای هر نقش، مجوزها را با کلیک روی چک‌باکس فعال یا غیرفعال کنید و سپس «ذخیره
        تغییرات» را بزنید.
      </p>

      <div className="admin-table-wrap overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr>
              <th>مجوز</th>
              {data.roles.map((role) => (
                <th key={role.slug} className="text-center">
                  {role.labelFa}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.permissions.map((permission) => (
              <tr key={permission}>
                <td className="font-mono text-xs text-muted" dir="ltr">
                  {permission}
                </td>
                {data.roles.map((role) => {
                  const allowed = (draft[role.slug] ?? []).includes(permission);
                  const isLockedRbac =
                    role.slug === 'super_admin' &&
                    permission === ADMIN_PERMISSIONS.security.rbac;
                  const readOnly =
                    (role.slug === 'super_admin' && !isSuperAdmin) || isLockedRbac;

                  return (
                    <td key={`${role.slug}-${permission}`} className="text-center">
                      <label
                        className={
                          readOnly
                            ? 'inline-flex cursor-not-allowed opacity-50'
                            : 'inline-flex cursor-pointer'
                        }
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-[var(--border)] text-[var(--primary)] accent-[var(--primary)] focus:ring-[var(--primary)]/30"
                          checked={allowed}
                          disabled={readOnly || saveMutationPending}
                          onChange={(event) =>
                            togglePermission(role.slug, permission, event.target.checked)
                          }
                          aria-label={`${role.labelFa} — ${permission}`}
                        />
                      </label>
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
            <h2 className="font-semibold text-foreground">{role.labelFa}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{role.descriptionFa}</p>
            <p className="mt-3 text-xs text-muted">
              {(draft[role.slug] ?? []).length} مجوز فعال
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function PermissionsPanel() {
  const editor = usePermissionsEditor();

  return (
    <SecurityPageShell routeId="security.permissions" actions={editor.headerActions}>
      <PermissionsMatrixContent editor={editor} />
    </SecurityPageShell>
  );
}
