'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { queryKeys, type AdminUsersParams } from '@/lib/api/query-keys';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function useUsers(params: AdminUsersParams = {}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: ({ signal }) => adminApi.listUsers(params, signal),
    enabled: isAdmin,
  });
}

export function useAdminAnalytics() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: ({ signal }) => adminApi.getAnalytics(signal),
    enabled: isAdmin,
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'CUSTOMER' | 'ADMIN' }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
  });
}
