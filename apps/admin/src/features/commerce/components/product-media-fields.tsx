'use client';

import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Label } from '@talashim/ui';
import { ImageUrlField } from '@/features/cms/components/image-url-field';
import { uploadMediaImage } from '@/features/cms/api/cms-api';
import { getApiErrorMessage } from '@/shared/api/axios-client';

const MAX_GALLERY = 10;
const MAX_VIDEOS = 10;
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

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

function GalleryImageRow({
  image,
  index,
  galleryImages,
  onGalleryChange,
}: {
  image: GalleryImageField;
  index: number;
  galleryImages: GalleryImageField[];
  onGalleryChange: (images: GalleryImageField[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useMutation({
    mutationFn: (file: File) => uploadMediaImage(file, { folder: 'products' }),
    onSuccess: (asset) => {
      onGalleryChange(updateGalleryAt(galleryImages, index, { url: asset.url }));
    },
  });

  return (
    <div className="space-y-2 rounded-2xl border border-border p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <Input
          className="min-w-0 flex-1 font-mono text-xs"
          dir="ltr"
          value={image.url}
          placeholder="URL تصویر"
          onChange={(e) => {
            onGalleryChange(updateGalleryAt(galleryImages, index, { url: e.target.value }));
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 px-3 text-xs"
          disabled={upload.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {upload.isPending ? 'آپلود…' : 'آپلود'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              upload.mutate(file);
            }
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 text-rose-600"
          onClick={() => onGalleryChange(galleryImages.filter((_, i) => i !== index))}
        >
          حذف
        </Button>
      </div>
      {upload.isError ? (
        <p className="text-xs text-rose-600">{getApiErrorMessage(upload.error)}</p>
      ) : null}
      <Input
        value={image.alt}
        placeholder="متن جایگزین (alt)"
        onChange={(e) => {
          onGalleryChange(updateGalleryAt(galleryImages, index, { alt: e.target.value }));
        }}
      />
      {image.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.url}
          alt={image.alt || `گالری ${index + 1}`}
          className="max-h-24 rounded-lg object-cover"
        />
      ) : null}
    </div>
  );
}

export function ProductMediaFields({
  imageUrl,
  onImageUrlChange,
  galleryImages,
  onGalleryChange,
  videos,
  onVideosChange,
}: ProductMediaFieldsProps) {
  return (
    <div className="md:col-span-2 space-y-6 border-t border-border pt-6">
      <ImageUrlField
        label="تصویر شاخص (thumbnail)"
        required
        hint="تصویر اصلی کارت محصول — URL یا آپلود فایل."
        value={imageUrl}
        onChange={onImageUrlChange}
        folder="products"
        previewAlt="پیش‌نمایش شاخص"
        inputClassName="mt-0 min-w-0 flex-1"
      />

      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label>گالری تصاویر</Label>
            <p className="text-xs text-stone-500">حداکثر {MAX_GALLERY} تصویر</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 text-xs"
            disabled={galleryImages.length >= MAX_GALLERY}
            onClick={() => onGalleryChange([...galleryImages, { url: '', alt: '' }])}
          >
            + تصویر
          </Button>
        </div>
        <div className="mt-3 space-y-3">
          {galleryImages.map((image, index) => (
            <GalleryImageRow
              key={`gallery-${index}`}
              image={image}
              index={index}
              galleryImages={galleryImages}
              onGalleryChange={onGalleryChange}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label>ویدیوهای محصول</Label>
            <p className="text-xs text-stone-500">حداکثر {MAX_VIDEOS} ویدیو (URL مستقیم)</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 text-xs"
            disabled={videos.length >= MAX_VIDEOS}
            onClick={() =>
              onVideosChange([
                ...videos,
                { title: '', videoUrl: '', thumbnailUrl: '', sortOrder: videos.length },
              ])
            }
          >
            + ویدیو
          </Button>
        </div>
        <div className="mt-3 space-y-3">
          {videos.map((video, index) => (
            <div
              key={`video-${index}`}
              className="space-y-2 rounded-2xl border border-border p-3"
            >
              <Input
                value={video.title}
                placeholder="عنوان ویدیو"
                onChange={(e) => {
                  onVideosChange(updateVideoAt(videos, index, { title: e.target.value }));
                }}
              />
              <Input
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
                onChange={(url: string) => {
                  onVideosChange(updateVideoAt(videos, index, { thumbnailUrl: url }));
                }}
                folder="products"
                previewAlt="بندانگشتی ویدیو"
                inputClassName="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 text-rose-600"
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
