import Image from 'next/image';
import Link from 'next/link';

export function FooterBrand() {
  return (
    <Link href="/" className="footer-brand" aria-label="Talashim">
      <div className="footer-brand-head">
        <div className="footer-brand-mark" aria-hidden>
          <span className="footer-brand-necklace-slot">
            <Image
              src="/images/footer/necklace.png"
              alt=""
              width={138}
              height={136}
              className="footer-brand-necklace"
              priority={false}
            />
          </span>
          <span className="footer-brand-ta">Ta</span>
          <span className="footer-brand-ashim">ashim</span>
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
