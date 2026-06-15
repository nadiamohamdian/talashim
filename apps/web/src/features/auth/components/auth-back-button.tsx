'use client';

import { useRouter } from 'next/navigation';

interface AuthBackButtonProps {
  fallbackHref?: string;
}

export function AuthBackButton({ fallbackHref = '/' }: AuthBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="auth-back-button"
      aria-label="بازگشت"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
          return;
        }
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
