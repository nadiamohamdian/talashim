import Script from 'next/script';
import { isValidGoogleAnalyticsId } from '@/shared/lib/build-site-metadata';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const trimmed = measurementId.trim();
  if (!isValidGoogleAnalyticsId(trimmed)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${trimmed}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trimmed}');
        `}
      </Script>
    </>
  );
}
