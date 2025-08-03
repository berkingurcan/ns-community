'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

interface OnboardingReminderProps {
  username?: string;
}

export function OnboardingReminder({ username }: OnboardingReminderProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleCompleteOnboarding = () => {
    router.push('/onboarding');
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4 mb-6 relative">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Welcome{username ? `, ${username}` : ''}! Complete your profile
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            You&#39;re almost there! Complete your onboarding to unlock all features and connect with the community.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleCompleteOnboarding}
              size="sm"
              className="flex items-center gap-2"
            >
              Complete Onboarding
              <ArrowRight className="h-3 w-3" />
            </Button>
            
            <Button 
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}