import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/shared/providers/app-providers";
import { SiteHeader } from "@/widgets/header/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sadaf Gold",
  description: "Modern gold e-commerce frontend built with Next.js and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-stone-950">
        <AppProviders>
          <SiteHeader />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
