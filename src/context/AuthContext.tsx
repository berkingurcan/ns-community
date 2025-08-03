
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    username: string;
    discord_id: string;
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
  isAuthorized: boolean | null; // null: unknown, false: not allowed, true: allowed
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  isAuthorized: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
      
      const { data, error } = await supabase
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

      if (error) {
        console.error('❌ Error creating initial profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        return null;
      }

      console.log('✅ Initial profile created:', data);
      return data;
    } catch (e) {
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
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📝 No profile found - creating initial profile...');
          const newProfile = await createInitialProfile(user);
          setUserProfile(newProfile);
        } else {
          console.error('❌ Profile fetch error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          setUserProfile(null);
        }
      } else {
        console.log('✅ Profile found:', data);
        console.log('Profile status:', data.status);
        console.log('Profile data:', JSON.stringify(data, null, 2));
        setUserProfile(data);
      }
    } catch (e) {
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
          try {
            await Promise.race([
              fetchUserProfile(currentUser),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 8000))
            ]);
          } catch (e) {
            console.error('Profile fetch failed:', e);
            // Continue anyway, don't block the app
          }
          
          try {
            await Promise.race([
              checkRoleAuthorization(currentUser),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Role check timeout')), 5000))
            ]);
          } catch (e) {
            console.error('Role authorization failed:', e);
            // Set authorized to true as fallback
            setIsAuthorized(true);
          }
        } else {
          console.log('No user, setting profile to null');
          setUserProfile(null);
          setIsAuthorized(null);
        }
      } catch (e) {
        console.error('Error in manageSession:', e);
      } finally {
        setLoading(false);
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
              setTimeout(() => reject(new Error('Connectivity test timeout')), 5000);
            });
            
            await Promise.race([connectivityTest, connectivityTimeout]);
            console.log('✅ Supabase connectivity OK');
          } catch (connectivityError) {
            console.error('❌ Supabase connectivity failed:', connectivityError);
            // Continue anyway, but with reduced timeout
          }
          
          // Now try to get session with timeout
          console.log('Fetching auth session...');
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Session fetch timeout')), 8000);
          });
          
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          console.log('Initial session:', session);
          console.log('Initial session error:', error);
          
          if (error) {
            console.error('Session fetch error:', error);
            setLoading(false);
            return;
          }
          
          await manageSession(session);
        } catch (e) {
          console.error('Error in getInitialSession:', e);
          setLoading(false);
        }
        console.log('=== GET INITIAL SESSION END ===');
    };

    // Longer delay to let wallet extensions settle completely
    setTimeout(getInitialSession, 1000);

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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          scopes: 'identify connections guilds guilds.members.read',
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
    } catch (e) {
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

  const value = {
    session,
    user,
    userProfile,
    isAuthorized,
    loading,
    login,
    logout,
    refreshProfile,
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



