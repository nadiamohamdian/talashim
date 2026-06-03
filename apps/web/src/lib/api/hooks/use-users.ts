'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { queryKeys, type AdminUsersParams } from '@/lib/api/query-keys';
import { isStaffRoleSlug } from '@talashim/shared/admin-rbac';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function useUsers(params: AdminUsersParams = {}) {
  const { user } = useAuth();
  const isAdmin = user?.role !== undefined && isStaffRoleSlug(user.role);

  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: ({ signal }) => adminApi.listUsers(params, signal),
    enabled: isAdmin,
  });
}

export function useAdminAnalytics() {
  const { user } = useAuth();
  const isAdmin = user?.role !== undefined && isStaffRoleSlug(user.role);

  return useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: ({ signal }) => adminApi.getAnalytics(signal),
    enabled: isAdmin,
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: 'CUSTOMER' | 'SUPER_ADMIN' | 'SUPPORT' | 'ACCOUNTANT' | 'EDITOR' | 'WAREHOUSE';
    }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}
