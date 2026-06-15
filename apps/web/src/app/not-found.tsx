import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="store-not-found">
      <div className="store-not-found-inner">
        <p className="store-not-found-code">۴۰۴</p>
        <h1 className="store-not-found-title">صفحه پیدا نشد</h1>
        <p className="store-not-found-lead">
          آدرسی که وارد کرده‌اید وجود ندارد یا موقتاً در دسترس نیست.
        </p>
        <Link href="/" className="store-not-found-link">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
