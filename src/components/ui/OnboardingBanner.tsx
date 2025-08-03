'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { OnboardingReminder } from './OnboardingReminder';

export function OnboardingBanner() {
  const { session, userProfile, isAuthorized, loading } = useAuth();
  const pathname = usePathname();

  // Don't show if loading or not authenticated
  if (loading || !session || isAuthorized !== true) {
    return null;
  }

  // Don't show on onboarding page itself
  if (pathname === '/onboarding') {
    return null;
  }

  // Don't show if user has active profile
  if (userProfile?.status === 'active') {
    return null;
  }

  // Show reminder if user needs onboarding
  if (userProfile?.status === 'needs_onboarding') {
    return (
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <OnboardingReminder username={userProfile.username} />
        </div>
      </div>
    );
  }

  return null;
}