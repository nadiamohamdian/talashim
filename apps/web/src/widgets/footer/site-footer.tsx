import Link from 'next/link';
import { webEnv } from '@/shared/config/env';
import { FOOTER_NAV } from '@/shared/config/storefront-ia';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-nude-200 bg-gradient-to-b from-nude-50 to-nude-100/80">
      <div className="container-store grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-gold-dark">{webEnv.NEXT_PUBLIC_APP_NAME}</p>
          <p className="mt-4 text-sm leading-8 text-muted">
            فروشگاه آنلاین طلا و جواهر — قیمت روز، خرید امن و ارسال سریع به سراسر کشور.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">فروشگاه</h3>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_NAV.shop.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted transition hover:text-gold-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">درباره ما</h3>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_NAV.company.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted transition hover:text-gold-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">قوانین</h3>
          <ul className="mt-4 space-y-2.5">
            {FOOTER_NAV.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted transition hover:text-gold-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-nude-200/80 py-5 text-center text-xs text-muted">
        تمام حقوق برای {webEnv.NEXT_PUBLIC_APP_NAME} محفوظ است.
      </div>
    </footer>
  );
}
