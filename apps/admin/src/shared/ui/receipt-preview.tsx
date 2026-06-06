'use client';

interface ReceiptPreviewProps {
  url: string;
  alt?: string;
  maxHeightClass?: string;
}

export function ReceiptPreview({
  url,
  alt = 'فیش واریز',
  maxHeightClass = 'max-h-80',
}: ReceiptPreviewProps) {
  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-stone-50">
      {isPdf ? (
        <div className="flex flex-col gap-2 p-4">
          <p className="text-sm text-stone-600">فایل PDF فیش واریز</p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-amber-800 underline"
          >
            باز کردن PDF در تب جدید
          </a>
        </div>
      ) : (
        <a href={url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt} className={`w-full object-contain ${maxHeightClass}`} />
        </a>
      )}
    </div>
  );
}

export function receiptFilenameFromUrl(url: string, fallback = 'receipt'): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split('/').pop();
    return segment && segment.length > 0 ? segment : fallback;
  } catch {
    return fallback;
  }
}

export function downloadReceipt(url: string, filename?: string) {
  const name = filename ?? receiptFilenameFromUrl(url);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.target = '_blank';
  anchor.rel = 'noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
