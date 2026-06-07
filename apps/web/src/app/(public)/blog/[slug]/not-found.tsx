import Link from 'next/link';

export default function BlogPostNotFound() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h1 className="text-xl font-bold text-stone-950 dark:text-zinc-50">مقاله یافت نشد</h1>
      <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-zinc-400">
        این مطلب وجود ندارد یا هنوز منتشر نشده است.
      </p>
      <Link href="/blog" className="btn-gold mt-6 inline-flex">
        بازگشت به مجله
      </Link>
    </div>
  );
}
