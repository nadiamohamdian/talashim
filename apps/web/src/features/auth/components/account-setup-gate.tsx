'use client';

import type { PropsWithChildren } from 'react';

/** Account setup is completed inside the profile panel — no global redirect gate. */
export function AccountSetupGate({ children }: PropsWithChildren) {
  return <>{children}</>;
}
