import Link from "next/link";
import type { Route } from "next";
import { Button } from "@gold/ui";
import { webEnv } from "@/shared/config/env";

const navigation: Array<{ href: Route; label: string }> = [
  { href: "/", label: "خانه" },
  { href: "/blog", label: "مجله طلا" },
  { href: "/login", label: "حساب کاربری" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Gold House</p>
          <Link href="/" className="text-lg font-bold text-stone-950">
            {webEnv.NEXT_PUBLIC_APP_NAME}
          </Link>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-stone-700 transition hover:text-stone-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" className="hidden md:inline-flex">
          قیمت روز طلا
        </Button>
      </div>
    </header>
  );
}
