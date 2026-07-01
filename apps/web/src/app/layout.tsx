import type { Metadata } from "next";

import "./globals.css";

import { GoogleAnalytics } from "@/features/site/components/google-analytics";
import { MaintenanceShell } from "@/features/site/components/maintenance-shell";
import { StorefrontThemeInitScript } from "@/shared/providers/storefront-theme-init-script";
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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
html { height: 100%; background-color: #ffffff; color: #3d3630; }
html.dark { background-color: #1f1c1a; color: #f5ede6; }
body { min-height: 100%; background-color: inherit; color: inherit; }
`,
          }}
        />
        <StorefrontThemeInitScript />
      </head>
      <body
        className="flex min-h-full flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
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
