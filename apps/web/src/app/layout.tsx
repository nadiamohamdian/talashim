import type { Metadata } from "next";

import "./globals.css";

import { GoogleAnalytics } from "@/features/site/components/google-analytics";
import { MaintenanceShell } from "@/features/site/components/maintenance-shell";
import { getPublicSeo, getPublishedBanners, getPublishedStaticPages } from "@/lib/api/cms.api";
import { fetchSiteConfig } from "@/lib/api/site.api";
import { buildSiteMetadata } from "@/shared/lib/build-site-metadata";

/** Always read maintenance flag and SEO fresh — stale cache would trap wrong site state. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublicSeo().catch(() => null);
  return buildSiteMetadata(seo);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, globalBanners, staticPages, seo] = await Promise.all([
    fetchSiteConfig(),
    getPublishedBanners('GLOBAL').catch(() => []),
    getPublishedStaticPages().catch(() => []),
    getPublicSeo().catch(() => null),
  ]);

  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {seo?.googleAnalyticsId ? (
          <GoogleAnalytics measurementId={seo.googleAnalyticsId} />
        ) : null}
        <MaintenanceShell initialSettings={settings} globalBanners={globalBanners} staticPages={staticPages}>
          {children}
        </MaintenanceShell>
      </body>
    </html>
  );
}
