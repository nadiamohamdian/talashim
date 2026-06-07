'use client';

import Link from 'next/link';
import type { PublicCmsStaticPageSummary } from '@sadafgold/types';
import {
  isLegalStaticPageSlug,
  resolveStaticPageHref,
} from '@/features/content/lib/static-page-paths';
import { FOOTER_NAV } from '@/shared/config/storefront-ia';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';

const FIXED_COMPANY_LINKS = [
  { label: 'تماس', href: '/contact' },
  { label: 'سوالات متداول', href: '/faq' },
] as const;

interface SiteFooterProps {
  staticPages?: PublicCmsStaticPageSummary[];
}

export function SiteFooter({ staticPages = [] }: SiteFooterProps) {
  const { general, commerce } = useStorefrontSettings();
  const companyLinks = general.supportPhone
    ? FIXED_COMPANY_LINKS
    : FIXED_COMPANY_LINKS.filter((item) => item.href !== '/contact');

  const cmsCompanyLinks = staticPages
    .filter((page) => !isLegalStaticPageSlug(page.slug))
    .map((page) => ({
      label: page.title,
      href: resolveStaticPageHref(page.slug),
    }));

  const cmsLegalLinks = staticPages
    .filter((page) => isLegalStaticPageSlug(page.slug))
    .map((page) => ({
      label: page.title,
      href: resolveStaticPageHref(page.slug),
    }));

  return (
    <footer className="mt-auto border-t border-nude-200 bg-gradient-to-b from-nude-50 to-nude-100/80">
      <div className="container-store grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-gold-dark">{general.storeName}</p>
          <p className="mt-4 text-sm leading-8 text-muted">
            {general.tagline ??
              'فروشگاه آنلاین طلا و جواهر — قیمت روز، خرید امن و ارسال سریع به سراسر کشور.'}
          </p>
          <p className="mt-3 text-sm text-muted">
            پشتیبانی: {general.supportPhone}
            <br />
            {general.supportEmail}
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
            {[...cmsCompanyLinks, ...companyLinks].map((item) => (
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
            {cmsLegalLinks.map((item) => (
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
        تمام حقوق برای {general.storeName} محفوظ است. قیمت‌ها به {commerce.currencyLabel}.
      </div>
    </footer>
  );
}
