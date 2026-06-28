import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { adminEnv } from '@/shared/config/env';
import { AppProviders } from '@/shared/providers/app-providers';
import { AdminThemeInitScript } from '@/shared/providers/admin-theme-init-script';

export const metadata: Metadata = {
  title: adminEnv.NEXT_PUBLIC_ADMIN_APP_NAME,
  description: 'پنل مدیریت طلاشیم',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
html { background-color: #ffffff; color: #3d3630; }
html.dark { background-color: #1f1c1a; color: #f5ede6; }
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
