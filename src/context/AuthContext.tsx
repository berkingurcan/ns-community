
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useWallet } from '@solana/wallet-adapter-react';
import { Session } from '@supabase/supabase-js';

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
            return;
        }

        try {
            console.log('Authenticating with Solana wallet...');
            
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
                return;
            }

            if (data.session) {
                console.log('Successfully authenticated with Solana wallet');
                setSession(data.session);
            } else {
                console.error('Authentication succeeded but no session was created');
            }
        } catch (err) {
            console.error('Unexpected error during Web3 authentication:', err);
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
