'use client';

import { Button, Label } from '@sadafgold/ui';
import { ImageUrlField } from '@/features/cms/components/image-url-field';
import { IMAGE_FRAME_PRESETS } from '@/features/cms/lib/image-frame-spec';

const MAX_GALLERY = 10;
const MAX_VIDEOS = 10;

export type GalleryImageField = { url: string; alt: string };
export type ProductVideoField = {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
};

interface ProductMediaFieldsProps {
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  hoverImageUrl: string;
  onHoverImageUrlChange: (value: string) => void;
  galleryImages: GalleryImageField[];
  onGalleryChange: (images: GalleryImageField[]) => void;
  videos: ProductVideoField[];
  onVideosChange: (videos: ProductVideoField[]) => void;
}

function updateGalleryAt(
  images: GalleryImageField[],
  index: number,
  patch: Partial<GalleryImageField>,
): GalleryImageField[] {
  const current = images[index];
  if (!current) {
    return images;
  }
  const next = [...images];
  next[index] = { ...current, ...patch };
  return next;
}

function updateVideoAt(
  videos: ProductVideoField[],
  index: number,
  patch: Partial<ProductVideoField>,
): ProductVideoField[] {
  const current = videos[index];
  if (!current) {
    return videos;
  }
  const next = [...videos];
  next[index] = { ...current, ...patch };
  return next;
}

export function ProductMediaFields({
  imageUrl,
  onImageUrlChange,
  hoverImageUrl,
  onHoverImageUrlChange,
  galleryImages,
  onGalleryChange,
  videos,
  onVideosChange,
}: ProductMediaFieldsProps) {
  return (
    <div className="space-y-6" data-span="full">
      <ImageUrlField
        label="تصویر شاخص (thumbnail)"
        required
        hint="تصویر اصلی کارت محصول — از کتابخانه رسانه انتخاب کنید."
        value={imageUrl}
        onChange={onImageUrlChange}
        folder="products"
        previewAlt="پیش‌نمایش شاخص"
        frame={IMAGE_FRAME_PRESETS.productThumbnail}
      />

      <ImageUrlField
        label="تصویر هاور"
        hint="اختیاری — اگر خالی بماند، همان تصویر شاخص در هاور کارت نمایش داده می‌شود."
        value={hoverImageUrl}
        onChange={onHoverImageUrlChange}
        folder="products"
        previewAlt="پیش‌نمایش هاور"
        frame={IMAGE_FRAME_PRESETS.productThumbnail}
      />

      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label>گالری تصاویر</Label>
            <p className="text-xs text-muted">حداکثر {MAX_GALLERY} تصویر — از کتابخانه رسانه</p>
          </div>
          <button
            type="button"
            className="btn-gold px-4 py-2 text-xs"
            disabled={galleryImages.length >= MAX_GALLERY}
            onClick={() => onGalleryChange([...galleryImages, { url: '', alt: '' }])}
          >
            + تصویر
          </button>
        </div>
        <div className="mt-3 space-y-4">
          {galleryImages.map((image, index) => (
            <div key={`gallery-${index}`} className="rounded-[var(--radius-xl)] border border-border bg-[var(--surface)]/50 p-4">
              <ImageUrlField
                label={`تصویر گالری ${index + 1}`}
                value={image.url}
                onChange={(url) => onGalleryChange(updateGalleryAt(galleryImages, index, { url }))}
                folder="products"
                previewAlt={image.alt || `گالری ${index + 1}`}
              />
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm"
                  value={image.alt}
                  placeholder="متن جایگزین (alt)"
                  onChange={(e) => {
                    onGalleryChange(updateGalleryAt(galleryImages, index, { alt: e.target.value }));
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-[var(--error)]"
                  onClick={() => onGalleryChange(galleryImages.filter((_, i) => i !== index))}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label>ویدیوهای محصول</Label>
            <p className="text-xs text-muted">حداکثر {MAX_VIDEOS} ویدیو (URL مستقیم)</p>
          </div>
          <button
            type="button"
            className="btn-gold px-4 py-2 text-xs"
            disabled={videos.length >= MAX_VIDEOS}
            onClick={() =>
              onVideosChange([
                ...videos,
                { title: '', videoUrl: '', thumbnailUrl: '', sortOrder: videos.length },
              ])
            }
          >
            + ویدیو
          </button>
        </div>
        <div className="mt-3 space-y-4">
          {videos.map((video, index) => (
            <div
              key={`video-${index}`}
              className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-[var(--surface)]/50 p-4"
            >
              <input
                className="w-full rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm"
                value={video.title}
                placeholder="عنوان ویدیو"
                onChange={(e) => {
                  onVideosChange(updateVideoAt(videos, index, { title: e.target.value }));
                }}
              />
              <input
                className="w-full rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm"
                value={video.videoUrl}
                placeholder="URL ویدیو"
                dir="ltr"
                onChange={(e) => {
                  onVideosChange(updateVideoAt(videos, index, { videoUrl: e.target.value }));
                }}
              />
              <ImageUrlField
                label="تصویر بندانگشتی (اختیاری)"
                value={video.thumbnailUrl}
                onChange={(url) => onVideosChange(updateVideoAt(videos, index, { thumbnailUrl: url }))}
                folder="products"
                previewAlt="بندانگشتی ویدیو"
              />
              <Button
                type="button"
                variant="outline"
                className="text-[var(--error)]"
                onClick={() => onVideosChange(videos.filter((_, i) => i !== index))}
              >
                حذف ویدیو
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
