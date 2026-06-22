'use client';

import { useRouter } from 'next/navigation';

interface AuthBackButtonProps {
  fallbackHref?: string;
  className?: string;
}

export function AuthBackButton({ fallbackHref = '/', className }: AuthBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className ? `auth-back-button ${className}` : 'auth-back-button'}
      aria-label="بازگشت"
      onClick={() => {
        router.push(fallbackHref);
      }}
    >
      <svg
        width="16"
        height="13"
        viewBox="0 0 16 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M15 6.5H1M1 6.5L6.5 1M1 6.5L6.5 12"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
