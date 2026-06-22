import type { AuthSession } from '@sadafgold/types';
import { useAuthStore } from '@/features/auth/model/auth-store';

/** Writes session to in-memory store before a full-page navigation. */
export function persistAuthSessionSync(session: AuthSession): void {
  useAuthStore.getState().setSession(session);
}
