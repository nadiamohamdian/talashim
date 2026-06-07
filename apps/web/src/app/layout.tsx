import type { Metadata } from "next";

import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { platformConfig } from "@sadafgold/shared";

import "./globals.css";

import { MaintenanceShell } from "@/features/site/components/maintenance-shell";
import { getPublishedBanners } from "@/lib/api/cms.api";
import { fetchSiteConfig } from "@/lib/api/site.api";



const persianSans = IBM_Plex_Sans_Arabic({

  variable: "--font-sans-primary",

  subsets: ["arabic", "latin"],

  weight: ["300", "400", "500", "600", "700"],

  display: "swap",

  preload: true,

  adjustFontFallback: true,

});



/** Always read maintenance flag fresh — stale cache would trap the storefront in maintenance mode. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: `${platformConfig.storeName} | ${platformConfig.nameEn}`,
    template: `%s | ${platformConfig.nameEn}`,
  },
  description: "فروش طلا، جواهرات و زیورآلات با قیمت روز و خرید آنلاین امن.",
};



export default async function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {
  const [settings, globalBanners] = await Promise.all([
    fetchSiteConfig(),
    getPublishedBanners('GLOBAL').catch(() => []),
  ]);

  return (

    <html

      lang="fa"

      dir="rtl"

      suppressHydrationWarning

      className={`${persianSans.variable} h-full antialiased`}

    >

      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">

        <MaintenanceShell initialSettings={settings} globalBanners={globalBanners}>
          {children}
        </MaintenanceShell>

      </body>

    </html>

  );

}

