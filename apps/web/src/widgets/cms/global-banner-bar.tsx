import Link from 'next/link';
import type { PublicCmsBanner } from '@sadafgold/types';

interface GlobalBannerBarProps {
  banners: PublicCmsBanner[];
}

export function GlobalBannerBar({ banners }: GlobalBannerBarProps) {
  const banner = banners[0];
  if (!banner) {
    return null;
  }

  const inner = (
    <div className="bg-gold px-4 py-2.5 text-center text-sm font-medium text-white">
      <span>{banner.title}</span>
      {banner.subtitle ? <span className="mx-2 opacity-80">—</span> : null}
      {banner.subtitle ? <span className="font-normal opacity-95">{banner.subtitle}</span> : null}
    </div>
  );

  if (banner.linkUrl) {
    return (
      <Link href={banner.linkUrl} className="block transition hover:opacity-95">
        {inner}
      </Link>
    );
  }

  return inner;
}
