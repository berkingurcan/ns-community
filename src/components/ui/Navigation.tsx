'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Briefcase,
  User,
  Link2,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

// Client-only wrapper to prevent hydration issues
function ClientOnlyWalletButton({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button 
        className={className}
        disabled
      >
        Select Wallet
      </button>
    );
  }

  return <WalletMultiButton className={className} />;
}

export function Navigation() {
  const { session, hasProfile, login, logout } = useAuth();
  const { publicKey, connected, disconnect } = useWallet();
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showNFTPopup, setShowNFTPopup] = useState(false);
  const [nftError, setNftError] = useState('');

  const isNewUser = connected && session && hasProfile === false;
  const isExistingUser = connected && session && hasProfile === true;

  const handleLogin = async () => {
    if (!connected || !publicKey) {
      // Wallet not connected, WalletMultiButton will handle connection
      return;
    }

    setIsAuthLoading(true);
    try {
      const result = await login();
      
      if (!result.success) {
        if (result.type === 'nft_required') {
          setNftError(result.error || 'User does not own required NFT from collection');
          setShowNFTPopup(true);
        } else {
          console.error('Login failed:', result.error);
          // Handle other error types if needed
        }
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      if (connected) {
        await disconnect();
      }
      // Redirect to homepage after logout
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still try to disconnect wallet even if logout fails
      if (connected) {
        try {
          await disconnect();
        } catch (disconnectError) {
          console.error('Error disconnecting wallet:', disconnectError);
        }
      }
    }
  };

  const handleCreateProject = () => {
    router.push('/projects?tab=create');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  const handleMyProjects = () => {
    router.push('/projects');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-3 group"
              >
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl animate-spin-slow opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-2xl">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  nsikke
                </span>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              {isExistingUser && (
                <>
                  <Button
                    onClick={handleCreateProject}
                    className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Project</span>
                  </Button>

                  <Button
                    onClick={handleMyProjects}
                    variant="ghost"
                    className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>My Projects</span>
                  </Button>

                  <Button
                    onClick={handleViewProfile}
                    variant="ghost"
                    className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Button>
                </>
              )}

              {/* Wallet Connection */}
              <div className="flex items-center space-x-3">
                {!connected && (
                  <ClientOnlyWalletButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-500 hover:!to-blue-500 !text-white !font-medium !rounded-xl !transition-all !duration-300 !px-6 !py-2" />
                )}

                {connected && !session && (
                  <div className="flex items-center space-x-3">
                    {/* Show connected wallet info */}
                    <Badge variant="secondary" className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-blue-500/10 border border-blue-400/30 text-blue-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </span>
                    </Badge>

                    <Button
                      onClick={handleLogin}
                      disabled={isAuthLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isAuthLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        'Authenticate'
                      )}
                    </Button>

                    {/* Change Wallet Button */}
                    <Button
                      onClick={async () => {
                        await disconnect();
                      }}
                      variant="ghost"
                      className="bg-white/10 hover:bg-white/20 text-white font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1"
                      title="Change Wallet"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Change</span>
                    </Button>
                  </div>
                )}

                {isNewUser && (
                  <div className="flex items-center space-x-3">
                    {/* Show connected wallet info */}
                    <Badge variant="secondary" className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-orange-500/10 border border-orange-400/30 text-orange-300">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </span>
                    </Badge>

                    <Button
                      onClick={() => router.push('/onboarding')}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300"
                    >
                      Complete Profile
                    </Button>

                    {/* Change Wallet Button */}
                    <Button
                      onClick={async () => {
                        await disconnect();
                      }}
                      variant="ghost"
                      className="bg-white/10 hover:bg-white/20 text-white font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1"
                      title="Change Wallet"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Change</span>
                    </Button>
                  </div>
                )}

                {isExistingUser && (
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-400/30 text-green-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </span>
                    </Badge>
                    
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1"
                      title="Logout and Disconnect Wallet"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Logout</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* NFT Required Dialog */}
      <Dialog open={showNFTPopup} onOpenChange={setShowNFTPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold">NFT Required</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {nftError}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowNFTPopup(false)}
              variant="destructive"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}