'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MemberLoginPrompt } from '@/features/auth/components/member-login-prompt';
import { AccountMobileHub } from '@/widgets/account/account-mobile-hub';

export function ProfileHubPage() {
  const router = useRouter();

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');

    const handleChange = () => {
      if (media.matches) {
        router.replace('/profile/info');
      }
    };

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [router]);

  return (
    <MemberLoginPrompt
      title="حساب کاربری"
      description="برای دسترسی به حساب کاربری وارد شوید."
      returnPath="/profile"
    >
      <div className="account-page account-page--hub store-chrome-light store-minimal-header">
        <div className="account-page-inner account-page-inner--hub">
          <AccountMobileHub />
        </div>
      </div>
    </MemberLoginPrompt>
  );
}
