
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User, PostgrestError } from '@supabase/supabase-js';
import { CoinService } from '@/lib/coins';
import { UserCoinBalance } from '@/types/coin';

export interface UserProfile {
    id: string;
    username: string;
    discord_id: string;
    discord_username?: string;
    status: 'needs_onboarding' | 'active' | 'banned';
    shill_yourself?: string;
    avatar_url?: string;
    expertises?: string[];
    github?: string;
    x_handle?: string;
    website_url?: string;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  coinBalance: UserCoinBalance | null;
  isAuthorized: boolean | null; // null: unknown, false: not allowed, true: allowed
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCoinBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  coinBalance: null,
  isAuthorized: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  refreshCoinBalance: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [coinBalance, setCoinBalance] = useState<UserCoinBalance | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);



  const checkRoleAuthorization = useCallback(async (user: User | null) => {
    if (!user) {
      setIsAuthorized(null);
      return;
    }

    // Temporarily disable Discord role checking to prevent spam
    // TODO: Fix Discord API configuration and re-enable this
    console.log("Discord role check temporarily disabled - allowing all authenticated users");
    setIsAuthorized(true);
    return;

    /* DISABLED - CAUSING SPAM
    try {
      console.log("=== DEBUG: Discord Role Check ===");
      console.log("User ID:", user.id);
      console.log("Session exists:", !!session);
      console.log("Provider token exists:", !!session?.provider_token);
      console.log("Full session:", JSON.stringify(session, null, 2));
      
      // Test if Edge Function is reachable
      console.log("Attempting to call Edge Function...");
      
      const { data, error } = await supabase.functions.invoke('check-discord-roles', {
        body: JSON.stringify({ test: true })
      });
      
      console.log("Edge Function response data:", data);
      console.log("Edge Function response error:", error);
      
      if (error) {
        console.error('Edge Function Error Details:', error);
        console.error('Error type:', typeof error);
        console.error('Error keys:', Object.keys(error));
        throw error;
      }
      
      console.log("Role check result:", data);
      setIsAuthorized(data.hasRequiredRole);

    } catch (e) {
      console.error("Failed to check Discord roles:", e);
      console.error("Full error object:", JSON.stringify(e, null, 2));
      
      // For now, let's allow access if Edge Function fails
      // This prevents users from being locked out due to Discord API issues
      console.warn("Setting isAuthorized to true due to Discord API failure - this is temporary");
      setIsAuthorized(true);
    }
    */
  }, []);

  const createInitialProfile = useCallback(async (user: User) => {
    console.log('Creating initial profile for user:', user.id);
    
    try {
      console.log('User metadata:', user.user_metadata);
      console.log('App metadata:', user.app_metadata);
      
      // Discord'dan bilgileri akıllıca çıkar
      const { extractProfileFromDiscord } = await import('@/types/profile');
      const discordProfile = extractProfileFromDiscord(user);
      
      // Add timeout to profile creation
      const insertQuery = supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          discord_id: discordProfile.discordId,
          username: discordProfile.username,
          avatar_url: user.user_metadata?.avatar_url,
          shill_yourself: discordProfile.shillYourself || null,
          github: discordProfile.github || null,
          x_handle: discordProfile.xHandle || null,
          status: 'needs_onboarding'
        })
        .select()
        .single();
        
      const insertTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timeout')), 5000)
      );
      
      const result = (await Promise.race([
        insertQuery,
        insertTimeout,
      ])) as { data: UserProfile | null; error: PostgrestError | null } | Error;

      if (result instanceof Error) {
        console.warn('⚠️ Profile creation timed out');
        return null;
      }
      
      const { data, error } = result;

      if (error) {
        if (error.message === 'Profile creation timeout') {
          console.warn('⚠️ Profile creation timed out');
        } else {
          console.error('❌ Error creating initial profile:', error.message || error);
        }
        return null;
      }

      console.log('✅ Initial profile created:', data);
      return data;
    } catch (e: unknown) {
      console.error('❌ Unexpected error creating profile:', e);
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(async (user: User | null, forceRefresh: boolean = false) => {
    console.log('=== FETCH USER PROFILE START ===');
    console.log('User ID:', user?.id);
    console.log('Force refresh:', forceRefresh);
    
    if (!user) {
      console.log('No user provided, setting profile to null');
      setUserProfile(null);
      return;
    }
    
    try {
      console.log('Fetching profile from database...');
      
      // Add timeout to database query
      const profileQuery = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      const queryTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );
      
      const result = (await Promise.race([
        profileQuery,
        queryTimeout,
      ])) as { data: UserProfile | null; error: PostgrestError | null } | Error;

      if (result instanceof Error) {
        console.warn('⚠️ Profile fetch timed out');
        setUserProfile(null);
        return;
      }
      
      const { data, error } = result;

      if (error) {
        if (error.message === 'Database query timeout') {
          console.warn('⚠️ Profile fetch timed out');
          setUserProfile(null);
        } else if (error.code === 'PGRST116') {
          console.log('📝 No profile found - creating initial profile...');
          const newProfile = await createInitialProfile(user);
          setUserProfile(newProfile);
        } else {
          console.error('❌ Profile fetch error:', error.message || error);
          setUserProfile(null);
        }
      } else {
        console.log('✅ Profile found:', data);
        setUserProfile(data);
      }
    } catch (e: unknown) {
      console.error('❌ Unexpected error in fetchUserProfile:', e);
      setUserProfile(null);
    }
    
    console.log('=== FETCH USER PROFILE END ===');
  }, [createInitialProfile]);

  useEffect(() => {
    let isProcessing = false;
    
    const manageSession = async (session: Session | null) => {
      if (isProcessing) {
        console.log('Session management already in progress, skipping...');
        return;
      }
      
      isProcessing = true;
      console.log('=== MANAGE SESSION START ===');
      console.log('Session exists:', !!session);
      console.log('User ID:', session?.user?.id);
      console.log('User email:', session?.user?.email);
      
      try {
        const currentUser = session?.user ?? null;
        
        setSession(session);
        setUser(currentUser);
        
        if (currentUser) {
          console.log('Fetching profile for authenticated user...');
          
          // Set loading to false first, then fetch profile in background
          setLoading(false);
          
          // Profile fetch with shorter timeout
          try {
            const profilePromise = fetchUserProfile(currentUser);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
            );
            
            await Promise.race([profilePromise, timeoutPromise]);
            console.log('✅ Profile fetched successfully');
          } catch (e: unknown) {
            console.warn('⚠️ Profile fetch failed or timed out:', (e as Error).message);
            // Try one more time with longer timeout in background
            setTimeout(async () => {
              try {
                await fetchUserProfile(currentUser);
                console.log('✅ Profile fetched on retry');
              } catch (retryError: unknown) {
                console.warn('⚠️ Profile retry also failed:', (retryError as Error).message);
              }
            }, 1000);
          }
          
          // Load coin balance in background
          setTimeout(async () => {
            try {
              console.log('🪙 Loading coin balance...');
              const balance = await CoinService.getUserBalance(currentUser.id);
              setCoinBalance(balance);
              console.log('✅ Coin balance loaded:', balance.balance);
            } catch (e: unknown) {
              console.warn('⚠️ Coin balance loading failed:', (e as Error).message);
            }
          }, 500);
          
          // Role authorization with shorter timeout
          try {
            const rolePromise = checkRoleAuthorization(currentUser);
            const roleTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Role check timeout')), 2000)
            );
            
            await Promise.race([rolePromise, roleTimeoutPromise]);
            console.log('✅ Role authorization completed');
          } catch (e: unknown) {
            console.warn('⚠️ Role authorization failed or timed out:', (e as Error).message);
            // Fallback to authorized
            setIsAuthorized(true);
          }
        } else {
          console.log('No user, setting profile to null');
          setUserProfile(null);
          setCoinBalance(null);
          setIsAuthorized(null);
          setLoading(false);
        }
      } catch (e: unknown) {
        console.error('Error in manageSession:', e);
        setLoading(false);
      } finally {
        isProcessing = false;
        console.log('=== MANAGE SESSION END ===');
      }
    };

    const getInitialSession = async () => {
        console.log('=== GET INITIAL SESSION START ===');
        try {
          // First test basic Supabase connectivity
          console.log('Testing Supabase connectivity...');
          try {
            const connectivityTest = supabase.from('user_profiles').select('count', { count: 'exact', head: true });
            const connectivityTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Connectivity test timeout')), 2000);
            });
            
            await Promise.race([connectivityTest, connectivityTimeout]);
            console.log('✅ Supabase connectivity OK');
          } catch (connectivityError: unknown) {
            console.warn('⚠️ Supabase connectivity test failed:', (connectivityError as Error).message);
            // Continue anyway - connectivity might be slow but working
          }
          
          // Now try to get session with timeout
          console.log('Fetching auth session...');
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Session fetch timeout')), 4000);
          });
          
          const result = (await Promise.race([
            sessionPromise,
            timeoutPromise,
          ])) as { data: { session: Session | null }; error: PostgrestError | null } | Error;

          if (result instanceof Error) {
            console.error('Session fetch error:', result);
            setLoading(false);
            return;
          }

          const { data: { session }, error } = result;
          console.log('Initial session:', session);
          console.log('Initial session error:', error);
          
          if (error) {
            console.error('Session fetch error:', error);
            setLoading(false);
            return;
          }
          
          await manageSession(session);
        } catch (e: unknown) {
          console.error('Error in getInitialSession:', e);
          setLoading(false);
        }
        console.log('=== GET INITIAL SESSION END ===');
    };

    // Short delay to let components settle
    setTimeout(getInitialSession, 300);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session:', session);
        await manageSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile, checkRoleAuthorization]);

  const login = async () => {
    console.log('=== LOGIN START ===');
    console.log('Attempting Discord OAuth login...');
    
    try {
      const getURL = () => {
        let url =
          process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
          process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
          'http://localhost:3000/';
        // Make sure to include `https://` when not localhost.
        url = url.startsWith('http') ? url : `https://${url}`;
        // Make sure to include a trailing `/`.
        url = url.endsWith('/') ? url : `${url}/`;
        return url;
      };

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          scopes: 'identify connections guilds guilds.members.read',
          redirectTo: getURL(), // Add this line
        },
      });
      
      console.log('OAuth response data:', data);
      console.log('OAuth response error:', error);
      
      if (error) {
        console.error('❌ Discord OAuth error:', error);
        console.error('Error code:', error.status);
        console.error('Error message:', error.message);
      } else {
        console.log('✅ Discord OAuth initiated successfully');
      }
    } catch (e: unknown) {
      console.error('❌ Unexpected error during login:', e);
    }
    
    console.log('=== LOGIN END ===');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Manually refreshing profile...');
      await fetchUserProfile(user, true);
    }
  };

  const refreshCoinBalance = async () => {
    if (user) {
      console.log('🪙 Refreshing coin balance...');
      try {
        const balance = await CoinService.getUserBalance(user.id);
        setCoinBalance(balance);
      } catch (error: unknown) {
        console.error('❌ Error refreshing coin balance:', error);
      }
    }
  };

  const value = {
    session,
    user,
    userProfile,
    coinBalance,
    isAuthorized,
    loading,
    login,
    logout,
    refreshProfile,
    refreshCoinBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



