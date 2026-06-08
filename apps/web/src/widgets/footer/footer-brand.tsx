import Image from 'next/image';
import Link from 'next/link';

export function FooterBrand() {
  return (
    <Link href="/" className="footer-brand group mx-auto block" aria-label="Talashim">
      <div className="footer-brand-inner">
        <div className="footer-brand-necklace" aria-hidden>
          <Image
            src="/images/footer/necklace.png"
            alt=""
            width={139}
            height={138}
            className="footer-brand-necklace-img"
            priority={false}
          />
        </div>

        <div className="footer-brand-lines" aria-hidden>
          <Image
            src="/images/footer/line-left.png"
            alt=""
            width={146}
            height={1}
            className="footer-brand-line footer-brand-line-left"
          />
          <Image
            src="/images/footer/line-right.png"
            alt=""
            width={113}
            height={1}
            className="footer-brand-line footer-brand-line-right"
          />
        </div>

        <p className="footer-brand-word footer-brand-word-ta">Ta</p>
        <p className="footer-brand-word footer-brand-word-ashim">ashim</p>
      </div>
    </Link>
  );
}
