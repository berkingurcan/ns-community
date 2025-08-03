'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { CollaborationRequestsModal } from '@/components/ui/CollaborationRequestsModal';
import { Briefcase, User, Link2, LogOut, Loader2, Mail, Zap, MessageSquare, Coins } from 'lucide-react';

export function Navigation() {
  const { session, userProfile, coinBalance, login, logout, loading, isAuthorized } = useAuth();
  const router = useRouter();
  const [showCollabRequests, setShowCollabRequests] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const renderAuthenticatedNav = () => {
    if (isAuthorized === null) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }

    if (isAuthorized) {
      return (
        <>
          <Button onClick={() => router.push('/')} variant="secondary" className="hidden sm:flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            All Projects
          </Button>
          <Button onClick={() => router.push('/opportunities')} variant="secondary" className="hidden sm:flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Opportunities
          </Button>
          <Button onClick={() => setShowCollabRequests(true)} variant="secondary" className="hidden sm:flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests
          </Button>
          <Button onClick={() => router.push('/profile')} variant="secondary" className="hidden sm:flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </Button>
          <div className="flex items-center space-x-3">
            {/* Continental Coin Balance Badge */}
            {coinBalance !== null && (
              <Button 
                onClick={() => router.push('/coins')} 
                variant="outline" 
                size="sm"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:from-yellow-100 hover:to-amber-100 text-amber-700 hover:text-amber-800 shadow-sm"
                title="Continental Coins - Every collaboration = 1 coin"
              >
                <Coins className="w-4 h-4" />
                <span className="font-semibold">{coinBalance.balance}</span>
                <span className="text-xs opacity-75">Continental</span>
              </Button>
            )}
            {userProfile && (
              <Badge variant="secondary" className="hidden sm:flex">
                {userProfile.username}
              </Badge>
            )}
            <Button onClick={handleLogout} variant="destructive" title="Logout">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm ml-2">Logout</span>
            </Button>
          </div>
        </>
      );
    } else {
      return (
        <div className="flex items-center space-x-3">
            <Button asChild variant="secondary">
                <a href="mailto:contact@example.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                </a>
            </Button>
            <Button onClick={handleLogout} variant="destructive" title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
        </div>
      );
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => router.push('/')} className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary rounded-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-full h-full bg-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Link2 className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">NSphere</span>
          </button>

          <div className="flex items-center space-x-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : session ? (
              renderAuthenticatedNav()
            ) : (
              <Button onClick={() => login()}>
                Login with Discord
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Collaboration Requests Modal */}
      <CollaborationRequestsModal
        isOpen={showCollabRequests}
        onClose={() => setShowCollabRequests(false)}
        currentUserId={userProfile?.id}
      />
    </nav>
  );
}



