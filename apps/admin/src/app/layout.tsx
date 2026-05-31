import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { adminEnv } from '@/shared/config/env';
import { AppProviders } from '@/shared/providers/app-providers';

export const metadata: Metadata = {
  title: adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME,
  description: 'Sadaf Gold enterprise admin panel',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark h-full antialiased">
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
