'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { queryKeys } from '@/lib/api/query-keys';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.user.wishlist(),
    queryFn: ({ signal }) => userApi.listWishlist(signal),
    enabled: isAuthenticated,
  });
}

export function useAddWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => userApi.addToWishlist(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.wishlist() });
    },
  });
}

export function useRemoveWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => userApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wishlist() });
    },
  });
}

export function useContactMutation() {
  return useMutation({
    mutationFn: userApi.submitContact,
  });
}
