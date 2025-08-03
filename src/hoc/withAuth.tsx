
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function withAuth(WrappedComponent: React.ComponentType): React.ComponentType {
  const AuthComponent = (props: Record<string, any>): React.ReactElement | null => {
    const { session, loading, isAuthorized, userProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) {
        return; // Wait until loading is finished
      }

      if (!session) {
        router.push('/'); // Not logged in, redirect to home
        return;
      }
      
      // Session exists, now check authorization and profile status
      if (isAuthorized === false) {
        router.push('/unauthorized'); // Logged in but not on the list
        return;
      }

      if (userProfile && userProfile.status === 'needs_onboarding' && isAuthorized === true) {
        router.push('/onboarding'); // Profile exists but needs onboarding
        return;
      }

      if (userProfile === null && isAuthorized === true) {
        // This shouldn't happen anymore since we auto-create profiles
        router.push('/onboarding');
        return;
      }

    }, [loading, session, isAuthorized, userProfile, router]);

    // While loading, or if conditions for rendering are not met yet, show a loader.
    if (loading || !session || isAuthorized !== true || !userProfile || userProfile.status !== 'active') {
      return <div>Loading...</div>; // Or a more sophisticated loading component
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
}


