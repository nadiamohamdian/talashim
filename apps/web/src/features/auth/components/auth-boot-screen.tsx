export function AuthBootScreen({
  message = 'در حال بررسی احراز هویت...',
  fullPage = false,
}: {
  message?: string;
  fullPage?: boolean;
}) {
  const content = <p className="auth-loading">{message}</p>;

  if (!fullPage) {
    return content;
  }

  return (
    <div className="auth-page store-no-chrome">
      <div className="auth-page-inner">
        <div className="auth-card auth-card--loading">{content}</div>
      </div>
    </div>
  );
}
