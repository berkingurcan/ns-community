'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { userProfile } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to NSphere</CardTitle>
        </CardHeader>
        <CardContent>
          {userProfile ? (
            <p>Welcome back, {userProfile.username}!</p>
          ) : (
            <p>Please log in to continue.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}