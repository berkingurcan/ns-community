
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
    const { publicKey, signMessage } = useWallet();

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

        const { data, error } = await supabase.auth.signInWithPassword({
            email: `${publicKey.toBase58()}@solana.com`,
            password: 'password', // This is a dummy password
        });

        if (error) {
            console.error('Error logging in:', error);
        } else {
            setSession(data.session);
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
