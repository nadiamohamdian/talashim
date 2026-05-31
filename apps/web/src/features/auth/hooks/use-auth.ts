'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  login,
  logout,
  requestOtp,
  verifyOtp,
} from '@/features/auth/api/auth-api';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { OtpRequestValues, OtpVerifyValues, PasswordLoginValues } from '@/features/auth/model/schemas';
import { resolvePostLoginPath } from '@/shared/routing/safe-redirect';

function useAuthRedirect() {
  const router = useRouter();
  return (next?: string | null) => {
    router.push(resolvePostLoginPath(next));
    router.refresh();
  };
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const otpIdentifier = useAuthStore((s) => s.otpIdentifier);
  const setSession = useAuthStore((s) => s.setSession);
  const setOtpIdentifier = useAuthStore((s) => s.setOtpIdentifier);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return {
    user,
    accessToken,
    otpIdentifier,
    isAuthenticated,
    setSession,
    setOtpIdentifier,
    clearSession,
  };
}

export function usePasswordLoginMutation(next?: string | null) {
  const setSession = useAuthStore((s) => s.setSession);
  const redirect = useAuthRedirect();

  return useMutation({
    mutationFn: (values: PasswordLoginValues) => login(values),
    onSuccess: (session) => {
      setSession(session);
      redirect(next);
    },
  });
}

export function useOtpRequestMutation(next?: string | null) {
  const setOtpIdentifier = useAuthStore((s) => s.setOtpIdentifier);
  const router = useRouter();

  return useMutation({
    mutationFn: (values: OtpRequestValues) => requestOtp(values),
    onSuccess: (_data, variables) => {
      setOtpIdentifier(variables.identifier);
      const params = new URLSearchParams({ identifier: variables.identifier });
      if (next) params.set('next', next);
      router.push(`/login/verify?${params.toString()}`);
    },
  });
}

export function useOtpVerifyMutation(next?: string | null) {
  const setSession = useAuthStore((s) => s.setSession);
  const redirect = useAuthRedirect();

  return useMutation({
    mutationFn: (values: OtpVerifyValues) => verifyOtp(values),
    onSuccess: (session) => {
      setSession(session);
      redirect(next);
    },
  });
}

export function useLogoutMutation() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
      router.push('/');
      router.refresh();
    },
  });
}
