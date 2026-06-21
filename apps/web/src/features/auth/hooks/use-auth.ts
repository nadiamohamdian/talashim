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
import { persistAuthSessionSync } from '@/features/auth/lib/persist-auth-session';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import type { AuthSession } from '@sadafgold/types';
import { useCartStore } from '@/features/cart/model/cart-store';
import { syncGuestCartToServer } from '@/features/cart/lib/sync-guest-cart';
import { resolvePostLoginPath } from '@/shared/routing/safe-redirect';
import { storeOtpExpiry } from '@/features/auth/hooks/use-otp-countdown';

async function redirectAfterSession(session: AuthSession, next?: string | null) {
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

  const path = resolvePostLoginPath(next);
  window.location.assign(path);
}

export function useAuth() {
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const otpIdentifier = useAuthStore((s) => s.otpIdentifier);
  const setSession = useAuthStore((s) => s.setSession);
  const setOtpIdentifier = useAuthStore((s) => s.setOtpIdentifier);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isAuthenticated = hydrated && Boolean(accessToken && user);

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
  return useMutation({
    mutationFn: (values: PasswordLoginValues) => login(values),
    onSuccess: (session) => {
      void redirectAfterSession(session, next);
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
  return useMutation({
    mutationFn: (values: OtpVerifyValues) => verifyOtp(values),
    onSuccess: (session) => {
      void redirectAfterSession(session, next);
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
