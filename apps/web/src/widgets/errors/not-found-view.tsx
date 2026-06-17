import Image from 'next/image';
import Link from 'next/link';

/** Figma Group 696 — combined 404 graphic (desktop) */
const NOT_FOUND_GRAPHIC_SRC = '/images/errors/Group%20696.png';

export function NotFoundView() {
  return (
    <div className="store-not-found-page">
      <div className="store-not-found-page-inner">
        <Image
          src={NOT_FOUND_GRAPHIC_SRC}
          alt=""
          width={698}
          height={549}
          className="store-not-found-graphic"
          priority
          unoptimized
        />

        <p className="store-not-found-message">صفحه موردنظر یافت نشد...</p>

        <Link href="/" className="store-not-found-cta">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
