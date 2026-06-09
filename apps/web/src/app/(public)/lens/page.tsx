import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedLensVideos } from '@/lib/api/cms.api';

export const metadata: Metadata = {
  title: 'لنز طلاشیم',
  description: 'ویدیوهای لنز طلاشیم — معرفی محصولات و کالکشن‌های طلا و جواهر',
};

export default async function LensPage() {
  const videos = await getPublishedLensVideos().catch(() => []);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-nude-200 bg-gradient-to-l from-nude-50 to-card p-6 md:p-8">
        <p className="text-xs font-medium tracking-widest text-muted">Talashim Lens</p>
        <h1 className="section-heading mt-1">لنز طلاشیم</h1>
        <p className="mt-3 text-sm text-muted">{videos.length} ویدیو</p>
      </div>

      {!videos.length ? (
        <p className="text-sm text-muted">هنوز ویدیویی منتشر نشده است.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {videos.map((video) => (
            <article
              key={video.id}
              className="overflow-hidden rounded-xl border border-nude-200 bg-card"
            >
              <video
                className="aspect-[9/16] w-full bg-nude-100 object-cover"
                src={video.videoUrl}
                poster={video.thumbnailUrl ?? undefined}
                controls
                playsInline
                preload="metadata"
              />
              {video.title ? (
                <p className="px-3 py-2 text-sm text-foreground">{video.title}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <Link href="/" className="link-gold text-sm">
        بازگشت به صفحه اصلی ←
      </Link>
    </div>
  );
}
