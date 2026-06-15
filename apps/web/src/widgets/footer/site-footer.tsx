'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PublicCmsStaticPageSummary } from '@sadafgold/types';
import { FooterBrand } from '@/widgets/footer/footer-brand';
import { FooterSocialIcons } from '@/widgets/footer/footer-social-icons';

const SERVICE_LINKS = [
  { label: 'پیگیری سفارش', href: '/orders' },
  { label: 'ارسال و مرجوعی', href: '/policies' },
  { label: 'سوالات متداول', href: '/faq' },
] as const;

const SUPPORT_LINKS = [
  { label: 'تماس با ما', href: '/contact' },
  { label: 'آدرس شعب', href: '/contact' },
  { label: 'درباره ما', href: '/about' },
] as const;

interface SiteFooterProps {
  staticPages?: PublicCmsStaticPageSummary[];
}

export function SiteFooter({ staticPages: _staticPages = [] }: SiteFooterProps) {
  return (
    <footer className="site-footer mt-auto w-full">
      <div className="site-footer-inner">
        <FooterBrand />

        <div className="site-footer-nav-row">
          <nav aria-label="خدمات فروشگاه" className="site-footer-col site-footer-col-services">
            <h3 className="site-footer-heading">خدمات</h3>
            <ul className="site-footer-links">
              {SERVICE_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="site-footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="پشتیبانی فروشگاه" className="site-footer-col site-footer-col-support">
            <h3 className="site-footer-heading">پشتیبانی</h3>
            <ul className="site-footer-links">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="site-footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <FooterSocialIcons />

        <div className="site-footer-divider" aria-hidden />

        <div className="site-footer-bottom">
          <Image
            src="/images/footer/enamad.png"
            alt="نماد اعتماد الکترونیکی"
            width={45}
            height={53}
            className="site-footer-enamad"
          />
          <p className="site-footer-copyright">
            © کلیه حقوق این وب سایت متعلق به طلاشیم است.
          </p>
        </div>
      </div>
    </footer>
  );
}
