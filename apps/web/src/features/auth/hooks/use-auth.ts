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
import type { OtpRequestValues, OtpVerifyValues, PhonePasswordLoginValues } from '@/features/auth/model/schemas';
import { persistAuthSessionSync } from '@/features/auth/lib/persist-auth-session';
import { normalizeIranPhone } from '@/features/auth/lib/phone';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import {
  useSessionRestoreStatus,
  useSessionVerified,
} from '@/features/auth/context/session-restore-context';
import type { AuthSession } from '@sadafgold/types';
import { useCartStore } from '@/features/cart/model/cart-store';
import { syncGuestCartToServer } from '@/features/cart/lib/sync-guest-cart';
import { resolvePostAuthPath } from '@/shared/routing/post-auth-redirect';
import { storeOtpExpiry } from '@/features/auth/hooks/use-otp-countdown';

async function redirectAfterSession(
  session: AuthSession,
  next: string | null | undefined,
  navigate: (path: string) => void,
) {
  persistAuthSessionSync(session);

  const guestItems = useCartStore.getState().items;
  if (guestItems.length > 0) {
    try {
      const { removedProductIds } = await syncGuestCartToServer(guestItems);
      const store = useCartStore.getState();
      for (const productId of removedProductIds) {
        store.removeItem(productId);
      }
      if (useCartStore.getState().items.length === 0) {
        store.clearCart();
      }
    } catch {
      // Guest cart remains in localStorage; cart page will retry merge.
    }
  }

  navigate(resolvePostAuthPath(session, next));
}

export function useAuth() {
  const hydrated = useAuthHydrated();
  const restoreStatus = useSessionRestoreStatus();
  const sessionVerified = useSessionVerified();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const sessionTrusted = useAuthStore((s) => s.sessionTrusted);
  const otpIdentifier = useAuthStore((s) => s.otpIdentifier);
  const setSession = useAuthStore((s) => s.setSession);
  const setOtpIdentifier = useAuthStore((s) => s.setOtpIdentifier);
  const clearSession = useAuthStore((s) => s.clearSession);
  const restoring = restoreStatus === 'restoring';
  const hasSession = Boolean(accessToken && user);
  const isAuthenticated =
    hydrated && !restoring && hasSession && (sessionVerified || sessionTrusted);

  return {
    user,
    accessToken,
    otpIdentifier,
    hydrated,
    isAuthenticated,
    setSession,
    setOtpIdentifier,
    clearSession,
  };
}

export function usePasswordLoginMutation(next?: string | null) {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: PhonePasswordLoginValues) =>
      login({
        identifier: normalizeIranPhone(values.phone),
        password: values.password,
      }),
    onSuccess: (session) => {
      void redirectAfterSession(session, next, router.push);
    },
  });
}

export function useOtpRequestMutation(next?: string | null) {
  const setOtpIdentifier = useAuthStore((s) => s.setOtpIdentifier);
  const router = useRouter();

  return useMutation({
    mutationFn: (values: OtpRequestValues) => requestOtp(values),
    onSuccess: (data, variables) => {
      storeOtpExpiry(variables.identifier, data.expiresInSeconds);
      setOtpIdentifier(variables.identifier);
      const params = new URLSearchParams({ identifier: variables.identifier });
      if (next) params.set('next', next);
      router.push(`/login/verify?${params.toString()}`);
    },
  });
}

export function useOtpVerifyMutation(next?: string | null) {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: OtpVerifyValues) => verifyOtp(values),
    onSuccess: (session) => {
      void redirectAfterSession(session, next, router.push);
    },
  });
}

export function useLogoutMutation() {
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
      window.location.replace('/');
    },
  });
}
