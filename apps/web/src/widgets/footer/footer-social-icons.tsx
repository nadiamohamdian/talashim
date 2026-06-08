import Image from 'next/image';

const SOCIAL_LINKS = [
  { label: 'اینستاگرام', href: '#' },
  { label: 'تلگرام', href: '#' },
  { label: 'واتساپ', href: '#' },
] as const;

export function FooterSocialIcons() {
  return (
    <div className="site-footer-socials">
      <div className="site-footer-social-strip-wrap">
        <Image
          src="/images/footer/social-icons.svg"
          alt=""
          width={60}
          height={13}
          className="site-footer-social-strip"
          aria-hidden
        />
        <div className="site-footer-social-links">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className="site-footer-social-hit"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
