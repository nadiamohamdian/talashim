'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  userApi,
  type ChangePasswordPayload,
  type CompleteOnboardingPayload,
  type UpdateProfilePayload,
} from '@/lib/api/user.api';
import { refreshSession } from '@/features/auth/api/auth-api';
import { persistAuthSessionSync } from '@/features/auth/lib/persist-auth-session';
import { queryKeys } from '@/lib/api/query-keys';
import type { CreateAddressPayload, SubmitKycPayload, UpdateAddressPayload } from '@sadafgold/types';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: ({ signal }) => userApi.getProfile(signal),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompleteOnboardingPayload) => userApi.completeOnboarding(payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      try {
        const session = await refreshSession();
        persistAuthSessionSync(session);
      } catch {
        // Profile refetch still reflects saved email.
      }
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => userApi.changePassword(payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      try {
        const session = await refreshSession();
        persistAuthSessionSync(session);
      } catch {
        // Profile refetch still reflects saved password state.
      }
    },
  });
}

export function useKycStatus() {
  return useQuery({
    queryKey: queryKeys.user.kyc(),
    queryFn: ({ signal }) => userApi.getKycStatus(signal),
  });
}

export function useSubmitKycMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitKycPayload) => userApi.submitKyc(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.kyc() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.user.addresses(),
    queryFn: ({ signal }) => userApi.listAddresses(signal),
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload) => userApi.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAddressPayload }) =>
      userApi.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
    },
  });
}
