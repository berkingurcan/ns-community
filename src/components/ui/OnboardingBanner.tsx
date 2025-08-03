'use client';

import { useAuth } from '@/context/AuthContext';

export function OnboardingBanner() {
  const { userProfile } = useAuth();

  // Simple banner - always return null for now
  if (userProfile) {
    return null;
  }

  return null;
}