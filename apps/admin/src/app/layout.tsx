import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Vazirmatn } from 'next/font/google';
import { adminEnv } from '@/shared/config/env';
import { AppProviders } from '@/shared/providers/app-providers';
import { AdminThemeInitScript } from '@/shared/providers/admin-theme-init-script';

const persianSans = Vazirmatn({
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
    <html lang="fa" dir="rtl" suppressHydrationWarning className={persianSans.variable}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
html { background-color: #f7f3ee; color: #3d3229; }
html.dark { background-color: #1e1c1a; color: #faf8f5; }
body { min-height: 100%; background-color: inherit; color: inherit; }
`,
          }}
        />
        <AdminThemeInitScript />
      </head>
      <body className="admin-canvas min-h-full bg-background font-sans text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
