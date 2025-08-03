'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';

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
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Project</span>
                  </Button>

                  <Button
                    onClick={handleMyProjects}
                    className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>My Projects</span>
                  </Button>

                  <Button
                    onClick={handleViewProfile}
                    className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
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
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 text-sm font-medium">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </span>
                    </div>

                    <Button
                      onClick={handleLogin}
                      disabled={isAuthLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isAuthLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                      className="bg-white/10 hover:bg-white/20 text-white font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1"
                      title="Change Wallet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="hidden sm:inline text-sm">Change</span>
                    </Button>
                  </div>
                )}

                {isNewUser && (
                  <div className="flex items-center space-x-3">
                    {/* Show connected wallet info */}
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-orange-500/10 border border-orange-400/30 rounded-xl">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-orange-300 text-sm font-medium">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </span>
                    </div>

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
                      className="bg-white/10 hover:bg-white/20 text-white font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1"
                      title="Change Wallet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="hidden sm:inline text-sm">Change</span>
                    </Button>
                  </div>
                )}

                {isExistingUser && (
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-400/30 rounded-xl">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm font-medium">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleLogout}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1"
                      title="Logout and Disconnect Wallet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="hidden sm:inline text-sm">Logout</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* NFT Required Popup */}
      {showNFTPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-red-500/30">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">NFT Required</h3>
              <p className="text-gray-300">{nftError}</p>
              <Button
                onClick={() => setShowNFTPopup(false)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-xl transition-all duration-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}