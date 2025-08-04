'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Briefcase, Link2, LogOut, Loader2, Mail, Zap, MessageSquare, Coins } from 'lucide-react';
import { CollaborationRequestsDrawer } from '@/components/ui/CollaborationRequestsDrawer';

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
            Ecosystem
          </Button>
          <Button onClick={() => router.push('/opportunities')} variant="secondary" className="hidden sm:flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Opportunities
          </Button>
          <Button onClick={() => setShowCollabRequests(true)} variant="secondary" className="hidden sm:flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests
          </Button>

          {/* Continental Coin Balance */}
          {coinBalance !== null && (
            <Button 
              onClick={() => router.push('/coins')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:from-yellow-100 hover:to-amber-100 text-amber-700 hover:text-amber-800 shadow-sm rounded-full"
              title="Continental Coins - Every collaboration = 1 coin"
            >
              <Coins className="w-4 h-4" />
              <span className="font-semibold">{coinBalance.balance}</span>
            </Button>
          )}

          {/* User Profile Component */}
          <div className="relative group">
            <div 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 rounded-full bg-black text-white border border-gray-800 p-1 cursor-pointer hover:bg-gray-900 transition-colors"
            >
              <div className="relative flex items-center">
                <div className="relative h-9 rounded-full flex items-center px-3 space-x-2">
                  <span className="sr-only">User menu</span>
                  {/* Discord Avatar */}
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt={userProfile.username || 'Discord Avatar'} className="h-7 w-7 rounded-full" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#5865F2] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                  )}
                  {/* Discord Username */}
                  {(userProfile?.discord_username || userProfile?.username) && (
                    <span className="font-medium text-white truncate hidden sm:inline-block">
                      {userProfile.discord_username || userProfile.username}
                    </span>
                  )}
                  {/* NS ID Flag */}
                  <span role="img" aria-label="NS ID">🏴</span>
                </div>
              </div>
            </div>
            {/* Hover Dropdown */}
            <div className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-border rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
              <div className="px-4 py-3">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                {(userProfile?.discord_username || userProfile?.username) && (
                  <p className="text-sm font-medium text-foreground truncate">
                    {userProfile.discord_username || userProfile.username}
                  </p>
                )}
                {userProfile?.discordId && (
                  <p className="text-sm text-muted-foreground truncate">
                    Discord ID: {userProfile.discordId}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  NS ID: <span role="img" aria-label="NS ID">🏴</span>
                </p>
              </div>
              <div className="py-1">
                <Button variant="ghost" onClick={handleLogout} className="w-full text-left justify-start px-4 py-2 text-sm text-foreground hover:bg-secondary">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
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
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex h-16 items-center justify-between w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 group">
          <button onClick={() => router.push('/')} className="flex items-center space-x-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary rounded-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-full h-full bg-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Link2 className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">NSphere</span>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
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
      
      {/* Collaboration Requests Drawer */}
      <CollaborationRequestsDrawer
        isOpen={showCollabRequests}
        onClose={() => setShowCollabRequests(false)}
        currentUserId={userProfile?.id}
      />
    </nav>
  );
}



