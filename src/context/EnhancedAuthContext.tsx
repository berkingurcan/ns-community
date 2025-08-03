'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { verifyNFTOwnership } from '@/lib/nftVerification';
import { validateNetwork, getConfiguredNetwork, NetworkValidationResult } from '@/lib/networkValidation';

interface UserProfile {
  id: string;
  wallet_address: string;
  discord_id: string;
  shill_yourself: string;
  expertises: string[];
  github: string | null;
  x_handle: string | null;
  created_at: string;
  updated_at: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
  type?: 'wallet_error' | 'nft_required' | 'network_error' | 'config_error' | 'auth_error' | 'session_error' | 'unknown_error';
}

interface AuthState {
  session: Session | null;
  userProfile: UserProfile | null;
  hasProfile: boolean | null;
  networkValidation: NetworkValidationResult | null;
  isValidatingNetwork: boolean;
  sessionWalletMismatch: boolean;
}

interface AuthContextType extends AuthState {
  login: () => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkUserProfile: () => Promise<void>;
  validateCurrentNetwork: () => Promise<NetworkValidationResult>;
  refreshAuth: () => Promise<void>;
}

const EnhancedAuthContext = createContext<AuthContextType>({
  session: null,
  userProfile: null,
  hasProfile: null,
  networkValidation: null,
  isValidatingNetwork: false,
  sessionWalletMismatch: false,
  login: async () => ({ success: false, error: 'Not implemented' }),
  logout: async () => {},
  checkUserProfile: async () => {},
  validateCurrentNetwork: async () => ({ isValid: false, currentNetwork: null, expectedNetwork: { name: '', cluster: 'mainnet-beta' as any, chainId: '', rpcUrl: '' }, message: '', shouldSwitchNetwork: false }),
  refreshAuth: async () => {},
});

export const EnhancedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    userProfile: null,
    hasProfile: null,
    networkValidation: null,
    isValidatingNetwork: false,
    sessionWalletMismatch: false,
  });

  const { publicKey, disconnect } = useWallet();
  const { connection } = useConnection();

  // Initialize session from Supabase on mount
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🚀 EnhancedAuth: Initializing session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ EnhancedAuth: Error getting session:', error);
          return;
        }

        if (session) {
          console.log('✅ EnhancedAuth: Found existing session', session.user.id);
          console.log('📝 EnhancedAuth: Setting existing session in state');
          setAuthState(prev => ({ ...prev, session }));
        } else {
          console.log('❌ EnhancedAuth: No existing session found');
        }
      } catch (error) {
        console.error('💥 EnhancedAuth: Error initializing session:', error);
      }
    };

    initializeSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 EnhancedAuth: Auth state changed:', event, session?.user?.id);
        console.log('📝 EnhancedAuth: Updating session in state from listener');
        setAuthState(prev => ({ ...prev, session }));
        
        // Profile check will be handled by the publicKey useEffect
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Run only once on mount

  const checkUserProfile = useCallback(async () => {
    if (!publicKey) {
      console.log('👤 No public key available for profile check');
      setAuthState(prev => ({ 
        ...prev, 
        hasProfile: null, 
        userProfile: null 
      }));
      return;
    }

    try {
      console.log('👤 Checking if user profile exists for wallet:', publicKey.toBase58());
      
      // Query with better error handling and shorter timeout
      let data, error;
      
      try {
        const result = await Promise.race([
          supabase
            .from('user_profiles')
            .select('*')
            .eq('wallet_address', publicKey.toBase58())
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile check timeout')), 5000)
          )
        ]);
        
        ({ data, error } = result as any);
      } catch (timeoutError) {
        console.warn('👤 Profile check timed out, assuming no profile exists');
        // On timeout, assume no profile exists rather than crashing
        setAuthState(prev => ({ 
          ...prev, 
          hasProfile: false, 
          userProfile: null 
        }));
        return;
      }

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          console.log('No user profile found');
          setAuthState(prev => ({ 
            ...prev, 
            hasProfile: false, 
            userProfile: null 
          }));
        } else {
          console.error('Error checking user profile:', error);
          setAuthState(prev => ({ 
            ...prev, 
            hasProfile: null, 
            userProfile: null 
          }));
        }
        return;
      }

      if (data) {
        console.log('✅ User profile found:', data);
        console.log('📝 Setting hasProfile = true');
        setAuthState(prev => ({ 
          ...prev, 
          hasProfile: true, 
          userProfile: data 
        }));
      } else {
        console.log('❌ No user profile found');
        console.log('📝 Setting hasProfile = false');
        setAuthState(prev => ({ 
          ...prev, 
          hasProfile: false, 
          userProfile: null 
        }));
      }
    } catch (error) {
      console.error('Unexpected error checking user profile:', error);
      setAuthState(prev => ({ 
        ...prev, 
        hasProfile: null, 
        userProfile: null 
      }));
    }
  }, [publicKey]);

  const validateCurrentNetwork = useCallback(async (): Promise<NetworkValidationResult> => {
    setAuthState(prev => ({ ...prev, isValidatingNetwork: true }));
    
    try {
      const expectedNetwork = getConfiguredNetwork();
      const result = await validateNetwork(connection, expectedNetwork, publicKey || undefined);
      
      setAuthState(prev => ({ 
        ...prev, 
        networkValidation: result,
        isValidatingNetwork: false 
      }));
      
      return result;
    } catch (error) {
      const errorResult: NetworkValidationResult = {
        isValid: false,
        currentNetwork: null,
        expectedNetwork: { name: 'Unknown', cluster: getConfiguredNetwork(), chainId: '', rpcUrl: '' },
        message: `Network validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        shouldSwitchNetwork: false,
      };
      
      setAuthState(prev => ({ 
        ...prev, 
        networkValidation: errorResult,
        isValidatingNetwork: false 
      }));
      
      return errorResult;
    }
  }, [connection, publicKey]);

  // Validate session-wallet consistency (less aggressive)
  const validateSessionWallet = useCallback(async () => {
    if (!authState.session || !publicKey) {
      setAuthState(prev => ({ ...prev, sessionWalletMismatch: false }));
      return;
    }

    try {
      // Get the wallet address associated with the current session
      const { data: sessionData } = await supabase.auth.getUser();
      
      // Check multiple possible locations for wallet address
      const sessionWallet = 
        sessionData.user?.user_metadata?.wallet_address ||
        sessionData.user?.user_metadata?.walletAddress ||
        sessionData.user?.app_metadata?.wallet_address ||
        sessionData.user?.identities?.[0]?.identity_data?.wallet_address;
      
      if (sessionWallet) {
        const currentWallet = publicKey.toBase58();
        const mismatch = sessionWallet !== currentWallet;
        
        setAuthState(prev => ({ ...prev, sessionWalletMismatch: mismatch }));
        
        if (mismatch) {
          console.warn('Session-wallet mismatch detected!', {
            sessionWallet: sessionWallet.slice(0, 8) + '...',
            currentWallet: currentWallet.slice(0, 8) + '...',
          });
        } else {
          console.log('Session-wallet validated successfully');
        }
      } else {
        // No wallet info in session - probably first time, don't flag as mismatch
        console.log('No wallet info in session metadata, skipping validation');
        setAuthState(prev => ({ ...prev, sessionWalletMismatch: false }));
      }
    } catch (error) {
      console.error('Error validating session-wallet consistency:', error);
      // Don't flag as mismatch on error - could be network issue
      setAuthState(prev => ({ ...prev, sessionWalletMismatch: false }));
    }
  }, [authState.session, publicKey]);

  // Initialize session and auth listeners
  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setAuthState(prev => ({ ...prev, session: data.session }));
      
      if (data.session && publicKey) {
        await checkUserProfile();
        await validateSessionWallet();
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState(prev => ({ ...prev, session }));
      
      if (event === 'SIGNED_OUT') {
        setAuthState(prev => ({
          ...prev,
          userProfile: null,
          hasProfile: null,
          sessionWalletMismatch: false,
        }));
      } else if (session && publicKey) {
        await checkUserProfile();
        await validateSessionWallet();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [publicKey, checkUserProfile, validateSessionWallet]);

  // Validate network and session when wallet changes
  useEffect(() => {
    const runValidations = async () => {
      if (publicKey) {
        await validateCurrentNetwork();
        await validateSessionWallet();
        
        if (authState.session) {
          await checkUserProfile();
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          userProfile: null,
          hasProfile: null,
          networkValidation: null,
          sessionWalletMismatch: false,
        }));
      }
    };

    runValidations();
  }, [publicKey, authState.session]);

  const login = async (): Promise<LoginResult> => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return { success: false, error: 'Wallet not connected', type: 'wallet_error' };
    }

    try {
      console.log('Starting enhanced authentication flow...');

      // 1. Validate network first
      const networkResult = await validateCurrentNetwork();
      if (!networkResult.isValid) {
        console.error('Network validation failed:', networkResult.message);
        return { 
          success: false, 
          error: networkResult.message, 
          type: 'network_error' 
        };
      }

      // 2. Check for session-wallet mismatch
      if (authState.sessionWalletMismatch) {
        console.log('Session-wallet mismatch detected, signing out existing session...');
        await supabase.auth.signOut();
        setAuthState(prev => ({ 
          ...prev, 
          session: null, 
          sessionWalletMismatch: false 
        }));
      }

      // 3. Verify NFT ownership
      const collectionAddress = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
      if (!collectionAddress) {
        console.error('NFT collection address not configured');
        return { 
          success: false, 
          error: 'NFT collection address not configured in environment variables', 
          type: 'config_error' 
        };
      }

      const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_URL || connection.rpcEndpoint;
      
      console.log('Verifying NFT ownership for collection:', collectionAddress);
      
      const hasNFT = await verifyNFTOwnership(publicKey, {
        collectionAddress,
        rpcEndpoint
      });

      if (!hasNFT) {
        console.error('User does not own required NFT from collection');
        return { 
          success: false, 
          error: 'User does not own required NFT from collection', 
          type: 'nft_required' 
        };
      }

      console.log('NFT ownership verified, proceeding with authentication...');
      
      // Debug wallet state before auth
      console.log('Wallet state before Supabase auth:', {
        publicKey: publicKey?.toBase58(),
        connected: !!publicKey
      });
      
      // 4. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'Sign in to NFT Gated App to verify your wallet ownership and access exclusive content.',
      });

      // Debug wallet state after auth
      console.log('Wallet state after Supabase auth:', {
        publicKey: publicKey?.toBase58(),
        connected: !!publicKey,
        hasSession: !!data?.session
      });

      if (error) {
        console.error('Error authenticating with Web3:', error);
        return { 
          success: false, 
          error: error.message, 
          type: 'auth_error' 
        };
      }

      if (data.session) {
        console.log('✅ Successfully authenticated with enhanced validation');
        console.log('📝 Setting session in auth state...');
        setAuthState(prev => ({ ...prev, session: data.session }));
        
        console.log('👤 Checking user profile...');
        await checkUserProfile();
        
        console.log('🔐 Final auth state summary:', {
          sessionId: data.session.user.id,
          publicKey: publicKey?.toBase58(),
          connected: !!publicKey
        });
        
        // Small delay to allow React state to propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✨ Login flow completed successfully');
        
        return { success: true };
      } else {
        console.error('Authentication succeeded but no session was created');
        return { 
          success: false, 
          error: 'Authentication succeeded but no session was created', 
          type: 'session_error' 
        };
      }
    } catch (err) {
      console.error('Error during enhanced authentication:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred', 
        type: 'unknown_error' 
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await disconnect();
    setAuthState({
      session: null,
      userProfile: null,
      hasProfile: null,
      networkValidation: null,
      isValidatingNetwork: false,
      sessionWalletMismatch: false,
    });
  };

  const refreshAuth = async () => {
    if (publicKey) {
      await validateCurrentNetwork();
      await validateSessionWallet();
      if (authState.session) {
        await checkUserProfile();
      }
    }
  };

  return (
    <EnhancedAuthContext.Provider 
      value={{
        ...authState,
        login,
        logout,
        checkUserProfile,
        validateCurrentNetwork,
        refreshAuth,
      }}
    >
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};