interface AuthSubmitButtonProps {
  children: string;
  isEnabled: boolean;
  isPending: boolean;
  pendingLabel?: string;
}

export function AuthSubmitButton({
  children,
  isEnabled,
  isPending,
  pendingLabel = 'در حال بارگذاری',
}: AuthSubmitButtonProps) {
  const state = isPending ? 'loading' : isEnabled ? 'active' : 'disabled';

  return (
    <button
      type="submit"
      className={`auth-submit auth-submit--${state}`}
      disabled={!isEnabled || isPending}
      aria-busy={isPending}
      aria-label={isPending ? pendingLabel : undefined}
    >
      {isPending ? (
        <span className="auth-submit-dots" aria-hidden>
          <span className="auth-submit-dot" />
          <span className="auth-submit-dot" />
          <span className="auth-submit-dot" />
          <span className="auth-submit-dot" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
