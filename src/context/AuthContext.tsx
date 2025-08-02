
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Session } from '@supabase/supabase-js';
import { verifyNFTOwnership } from '@/lib/nftVerification';

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
    type?: 'wallet_error' | 'config_error' | 'nft_required' | 'auth_error' | 'session_error' | 'unknown_error';
}

const AuthContext = createContext<{
    session: Session | null;
    userProfile: UserProfile | null;
    hasProfile: boolean | null;
    login: () => Promise<LoginResult>;
    logout: () => Promise<void>;
    checkUserProfile: () => Promise<void>;
}>({
    session: null,
    userProfile: null,
    hasProfile: null,
    login: async () => ({ success: false }),
    logout: async () => {},
    checkUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    const checkUserProfile = useCallback(async () => {
        if (!publicKey) {
            console.log('No public key available for profile check');
            setHasProfile(null);
            setUserProfile(null);
            return;
        }

        try {
            console.log('Checking if user profile exists for wallet:', publicKey.toBase58());
            
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('wallet_address', publicKey.toBase58())
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No profile found
                    console.log('No user profile found');
                    setHasProfile(false);
                    setUserProfile(null);
                } else {
                    console.error('Error checking user profile:', error);
                    setHasProfile(null);
                    setUserProfile(null);
                }
                return;
            }

            if (data) {
                console.log('User profile found:', data);
                setHasProfile(true);
                setUserProfile(data);
            } else {
                console.log('No user profile found');
                setHasProfile(false);
                setUserProfile(null);
            }
        } catch (error) {
            console.error('Unexpected error checking user profile:', error);
            setHasProfile(null);
            setUserProfile(null);
        }
    }, [publicKey]);

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            if (data.session && publicKey) {
                await checkUserProfile();
            }
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            if (event === 'SIGNED_OUT') {
                setUserProfile(null);
                setHasProfile(null);
            } else if (session && publicKey) {
                await checkUserProfile();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [publicKey, checkUserProfile]);

    // Check profile when publicKey changes
    useEffect(() => {
        if (session && publicKey) {
            checkUserProfile();
        } else if (!publicKey) {
            setUserProfile(null);
            setHasProfile(null);
        }
    }, [publicKey, session, checkUserProfile]);

    const login = async (): Promise<LoginResult> => {
        if (!publicKey) {
            console.error('Wallet not connected');
            return { success: false, error: 'Wallet not connected', type: 'wallet_error' };
        }

        try {
            console.log('Authenticating with Solana wallet...');

            // First, verify NFT ownership before proceeding with authentication
            const collectionAddress = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
            if (!collectionAddress) {
                console.error('NFT collection address not configured');
                return { success: false, error: 'NFT collection address not configured in environment variables', type: 'config_error' };
            }

            const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_URL || connection.rpcEndpoint;
            
            console.log('Verifying NFT ownership for collection:', collectionAddress);
            
            const hasNFT = await verifyNFTOwnership(publicKey, {
                collectionAddress,
                rpcEndpoint
            });

            if (!hasNFT) {
                console.error('User does not own required NFT from collection');
                return { success: false, error: 'User does not own required NFT from collection', type: 'nft_required' };
            }

            console.log('NFT ownership verified, proceeding with authentication...');
            
            // Use Supabase's native Web3 authentication for Solana
            const { data, error } = await supabase.auth.signInWithWeb3({
                chain: 'solana',
                statement: 'Sign in to NFT Gated App to verify your wallet ownership and access exclusive content.',
                // The wallet adapter will automatically handle the wallet connection
            });

            if (error) {
                console.error('Error authenticating with Web3:', error);
                if (error.message.includes('Web3 provider not found')) {
                    console.error('Make sure your wallet is connected and the Web3 provider is enabled in Supabase.');
                }
                return { success: false, error: error.message, type: 'auth_error' };
            }

            if (data.session) {
                console.log('Successfully authenticated with Solana wallet and NFT verification');
                setSession(data.session);
                // Check for user profile after successful authentication
                await checkUserProfile();
                return { success: true };
            } else {
                console.error('Authentication succeeded but no session was created');
                return { success: false, error: 'Authentication succeeded but no session was created', type: 'session_error' };
            }
        } catch (err) {
            console.error('Error during authentication:', err);
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error occurred', type: 'unknown_error' };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUserProfile(null);
        setHasProfile(null);
    };

    return (
        <AuthContext.Provider value={{ session, userProfile, hasProfile, login, logout, checkUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
