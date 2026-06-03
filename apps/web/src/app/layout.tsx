import type { Metadata } from "next";

import { IBM_Plex_Sans_Arabic } from "next/font/google";

import "./globals.css";

import { ClientRoot } from "@/shared/providers/client-root";



const persianSans = IBM_Plex_Sans_Arabic({

  variable: "--font-sans-primary",

  subsets: ["arabic", "latin"],

  weight: ["300", "400", "500", "600", "700"],

  display: "swap",

  preload: true,

  adjustFontFallback: true,

});



export const metadata: Metadata = {

  title: "گالری طلای تلاشیم | Talashim",

  description: "فروش طلا، جواهرات و زیورآلات با قیمت روز و خرید آنلاین امن.",

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

      suppressHydrationWarning

      className={`${persianSans.variable} h-full antialiased`}

    >

      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">

        <ClientRoot>{children}</ClientRoot>

      </body>

    </html>

  );

}

