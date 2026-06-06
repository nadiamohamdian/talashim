import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { adminEnv } from '@/shared/config/env';
import { AppProviders } from '@/shared/providers/app-providers';

const persianSans = IBM_Plex_Sans_Arabic({
  variable: '--font-sans-primary',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME,
  description: 'پنل مدیریت طلاشیم',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={`${persianSans.variable} light h-full antialiased`}
    >
      <body className="admin-canvas min-h-full bg-background font-sans text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
