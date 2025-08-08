'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { X, User, ArrowRight } from 'lucide-react';

export function OnboardingBanner() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user has completed onboarding or banner is dismissed
  if (!userProfile || userProfile.status === 'active' || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Complete your profile</span> to unlock all features and connect with the community.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => router.push('/onboarding')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-auto"
            >
              Complete Profile
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}