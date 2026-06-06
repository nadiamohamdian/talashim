interface RichHtmlContentProps {
  html: string;
  className?: string;
}

/** Renders trusted admin-authored HTML with basic hardening. */
export function RichHtmlContent({ html, className }: RichHtmlContentProps) {
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

  if (!sanitized.trim() || sanitized === '<br>') {
    return <p className="text-sm text-muted">توضیحی ثبت نشده است.</p>;
  }

  return (
    <div
      className={className}
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
