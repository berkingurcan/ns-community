'use client';

import { useEnhancedAuth } from '@/context/EnhancedAuthContext';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Shield, Network } from 'lucide-react';

interface AuthCheckResult {
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  errorType: 'network' | 'nft' | 'session' | 'profile' | 'config' | null;
}

const withEnhancedAuth = (WrappedComponent: React.ComponentType) => {
  const EnhancedAuthComponent = (props: React.ComponentProps<typeof WrappedComponent>) => {
    const { 
      session, 
      hasProfile, 
      networkValidation, 
      isValidatingNetwork,
      sessionWalletMismatch,
      validateCurrentNetwork,
      refreshAuth,
      logout 
    } = useEnhancedAuth();
    
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const router = useRouter();
    
    const [authCheck, setAuthCheck] = useState<AuthCheckResult>({
      isAuthorized: false,
      isLoading: true,
      error: null,
      errorType: null,
    });

    const runFullAuthCheck = async () => {
      setAuthCheck(prev => ({ ...prev, isLoading: true, error: null, errorType: null }));

      try {
        // 1. Check session first
        if (!session) {
          console.log('No session found, redirecting to home');
          router.push('/');
          return;
        }

        // 2. Check wallet connection
        if (!publicKey) {
          console.log('No wallet connected, redirecting to home');
          router.push('/');
          return;
        }

        console.log('Session and wallet both present:', {
          hasSession: !!session,
          walletAddress: publicKey.toBase58().slice(0, 8) + '...'
        });

        // 3. Check for session-wallet mismatch (but don't block immediately)
        if (sessionWalletMismatch) {
          console.warn('Session-wallet mismatch detected, but continuing...');
          // Don't block here - just log warning and continue
        }

        // 3. Check network validation
        if (!networkValidation || !networkValidation.isValid) {
          const validation = await validateCurrentNetwork();
          if (!validation.isValid) {
            setAuthCheck({
              isAuthorized: false,
              isLoading: false,
              error: validation.message,
              errorType: 'network',
            });
            return;
          }
        }

        // 4. Check profile requirement
        if (hasProfile === false) {
          router.push('/onboarding');
          return;
        }

        if (hasProfile === null) {
          // Still checking profile
          return;
        }

        // 5. Skip NFT re-verification - only checked during login

        // All checks passed
        setAuthCheck({
          isAuthorized: true,
          isLoading: false,
          error: null,
          errorType: null,
        });

      } catch (error) {
        console.error('Error in enhanced auth check:', error);
        setAuthCheck({
          isAuthorized: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown authentication error',
          errorType: 'config',
        });
      }
    };

    // Run auth check when dependencies change
    useEffect(() => {
      runFullAuthCheck();
    }, [session, publicKey, hasProfile, networkValidation, sessionWalletMismatch]);

    // Loading state
    if (authCheck.isLoading || isValidatingNetwork) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <div>
                  <h3 className="font-semibold">Validating Access</h3>
                  <p className="text-sm text-gray-600">
                    {isValidatingNetwork ? 'Checking network...' : 'Verifying authentication...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Error states with specific handling
    if (!authCheck.isAuthorized && authCheck.error) {
      const handleRetry = async () => {
        await refreshAuth();
        await runFullAuthCheck();
      };

      const handleSwitchNetwork = () => {
        // This would typically open wallet's network switcher
        // For now, show instructions
        alert('Please switch your wallet to the correct network and try again.');
      };

      const handleReconnect = async () => {
        await logout();
        router.push('/');
      };

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                {authCheck.errorType === 'network' && <Network className="h-6 w-6 text-red-600" />}
                {authCheck.errorType === 'nft' && <Shield className="h-6 w-6 text-red-600" />}
                {authCheck.errorType === 'session' && <WifiOff className="h-6 w-6 text-red-600" />}
                {(!authCheck.errorType || authCheck.errorType === 'config') && <AlertTriangle className="h-6 w-6 text-red-600" />}
              </div>
              <CardTitle className="text-lg font-semibold text-red-800">
                {authCheck.errorType === 'network' && 'Network Mismatch'}
                {authCheck.errorType === 'nft' && 'NFT Required'}
                {authCheck.errorType === 'session' && 'Session Error'}
                {(!authCheck.errorType || authCheck.errorType === 'config') && 'Access Denied'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-700">{authCheck.error}</p>
              </div>

              {/* Network-specific help */}
              {authCheck.errorType === 'network' && networkValidation && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Current:</strong> {networkValidation.currentNetwork?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Expected:</strong> {networkValidation.expectedNetwork.name}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                {authCheck.errorType === 'network' && (
                  <Button onClick={handleSwitchNetwork} className="w-full" variant="outline">
                    <Network className="mr-2 h-4 w-4" />
                    Switch Network
                  </Button>
                )}
                
                {authCheck.errorType === 'session' && (
                  <Button onClick={handleReconnect} className="w-full" variant="outline">
                    <Wifi className="mr-2 h-4 w-4" />
                    Reconnect Wallet
                  </Button>
                )}

                {authCheck.errorType === 'nft' && (
                  <Button onClick={() => router.push('/unauthorized')} className="w-full" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Learn About NFT Access
                  </Button>
                )}

                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Validation
                </Button>

                <Button onClick={() => router.push('/')} variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Unauthorized without specific error (shouldn't happen, but safety net)
    if (!authCheck.isAuthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Access Denied</h3>
              <p className="text-sm text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <Button onClick={() => router.push('/')} className="w-full">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Success - render the protected component
    return <WrappedComponent {...props} />;
  };

  return EnhancedAuthComponent;
};

export default withEnhancedAuth;