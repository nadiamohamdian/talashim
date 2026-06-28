import Image from 'next/image';
import Link from 'next/link';

export function FooterBrand() {
  return (
    <Link href="/" className="footer-brand" aria-label="Talashim">
      <div className="footer-brand-head">
        <div className="footer-brand-mark" aria-hidden>
          <Image
            src="/images/footer/talashim-brand-mark.png"
            alt=""
            width={194}
            height={140}
            className="footer-brand-mark-image"
            priority={false}
          />
        </div>

        <div className="footer-brand-lines" aria-hidden>
          <span className="footer-brand-line" />
          <span className="footer-brand-line-gap" />
          <span className="footer-brand-line" />
        </div>
      </div>
    </Link>
  );
}
