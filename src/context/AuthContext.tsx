
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Session } from '@supabase/supabase-js';
import { verifyNFTOwnership } from '@/lib/nftVerification';

const AuthContext = createContext<{
    session: Session | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}>({
    session: null,
    login: async () => {},
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const login = async () => {
        if (!publicKey) {
            console.error('Wallet not connected');
            throw new Error('Wallet not connected');
        }

        try {
            console.log('Authenticating with Solana wallet...');

            // First, verify NFT ownership before proceeding with authentication
            const collectionAddress = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
            if (!collectionAddress) {
                console.error('NFT collection address not configured');
                throw new Error('NFT collection address not configured in environment variables');
            }

            const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_URL || connection.rpcEndpoint;
            
            console.log('Verifying NFT ownership for collection:', collectionAddress);
            
            const hasNFT = await verifyNFTOwnership(publicKey, {
                collectionAddress,
                rpcEndpoint
            });

            if (!hasNFT) {
                console.error('User does not own required NFT from collection');
                throw new Error('You must own an NFT from the required collection to access this application');
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
                throw error;
            }

            if (data.session) {
                console.log('Successfully authenticated with Solana wallet and NFT verification');
                setSession(data.session);
            } else {
                console.error('Authentication succeeded but no session was created');
                throw new Error('Authentication succeeded but no session was created');
            }
        } catch (err) {
            console.error('Error during authentication:', err);
            throw err;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ session, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
