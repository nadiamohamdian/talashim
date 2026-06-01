'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Input, Label } from '@sadafgold/ui';
import { registerMediaAsset } from '../api/cms-api';
import { CmsPageShell } from './cms-page-shell';
import { selectFieldClass } from '../lib/labels';

export function MediaUploadPanel() {
  const [filename, setFilename] = useState('');
  const [url, setUrl] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [sizeBytes, setSizeBytes] = useState(0);
  const [alt, setAlt] = useState('');
  const [folder, setFolder] = useState('general');
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: registerMediaAsset,
    onSuccess: (asset) => {
      setSuccessUrl(asset.url);
      setFilename('');
      setUrl('');
      setAlt('');
      setSizeBytes(0);
    },
  });

  return (
    <CmsPageShell routeId="media.upload">
      <Card className="max-w-xl space-y-4 border-border bg-white p-6">
        <p className="text-sm text-stone-600">
          فایل را در CDN یا فضای ذخیره‌سازی خود آپلود کنید، سپس URL را اینجا ثبت کنید.
        </p>
        <div>
          <Label>نام فایل</Label>
          <Input className="mt-1" value={filename} onChange={(e) => setFilename(e.target.value)} />
        </div>
        <div>
          <Label>URL عمومی</Label>
          <Input
            className="mt-1 font-mono text-xs"
            dir="ltr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div>
          <Label>نوع MIME</Label>
          <select
            className={selectFieldClass}
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
          >
            <option value="image/jpeg">image/jpeg</option>
            <option value="image/png">image/png</option>
            <option value="image/webp">image/webp</option>
            <option value="video/mp4">video/mp4</option>
          </select>
        </div>
        <div>
          <Label>حجم (بایت)</Label>
          <Input
            className="mt-1"
            type="number"
            value={sizeBytes || ''}
            onChange={(e) => setSizeBytes(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>متن جایگزین (alt)</Label>
          <Input className="mt-1" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div>
          <Label>پوشه</Label>
          <select
            className={selectFieldClass}
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          >
            <option value="general">general</option>
            <option value="products">products</option>
            <option value="blog">blog</option>
            <option value="banners">banners</option>
          </select>
        </div>
        <Button
          disabled={upload.isPending || !filename || !url || sizeBytes <= 0}
          onClick={() =>
            upload.mutate({
              filename,
              url,
              mimeType,
              sizeBytes,
              alt: alt || undefined,
              folder,
            })
          }
        >
          {upload.isPending ? 'در حال ثبت…' : 'ثبت در کتابخانه'}
        </Button>
        {successUrl ? <p className="text-sm text-emerald-700">ثبت شد: {successUrl}</p> : null}
        {upload.isError ? (
          <p className="text-sm text-rose-600">ثبت ناموفق بود. URL و حجم را بررسی کنید.</p>
        ) : null}
      </Card>
    </CmsPageShell>
  );
}
