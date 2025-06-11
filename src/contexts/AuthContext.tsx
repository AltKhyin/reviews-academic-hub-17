
// ABOUTME: Optimized authentication context with request deduplication and caching
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  role: 'user' | 'admin'; // Simplified: removed 'editor'
  full_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  bio: string | null;
  institution: string | null;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Global cache for auth-related data to prevent duplicate requests
const authCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const pendingRequests = new Map<string, Promise<any>>();

const CACHE_TTL = {
  PROFILE: 5 * 60 * 1000, // 5 minutes
  ADMIN_CHECK: 10 * 60 * 1000, // 10 minutes
};

// Cache helper functions
const getCachedData = (key: string) => {
  const cached = authCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  authCache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttl: number) => {
  authCache.set(key, { data, timestamp: Date.now(), ttl });
};

const clearUserCache = (userId: string) => {
  const keysToDelete = [];
  for (const [key] of authCache) {
    if (key.startsWith(`user_${userId}_`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => authCache.delete(key));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simplified admin check - no more editor role
  const isAdmin = profile?.role === 'admin';

  // Deduplicated profile fetch with caching
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const cacheKey = `user_${userId}_profile`;
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    // Create new request
    const profilePromise = (async () => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, specialty, bio, institution')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error);
          return null;
        }

        const userProfile: UserProfile = {
          id: profileData?.id || userId,
          role: profileData?.role === 'admin' ? 'admin' : 'user', // Simplified: only admin or user
          full_name: profileData?.full_name || null,
          avatar_url: profileData?.avatar_url || null,
          specialty: profileData?.specialty || null,
          bio: profileData?.bio || null,
          institution: profileData?.institution || null,
        };

        // Cache the result
        setCachedData(cacheKey, userProfile, CACHE_TTL.PROFILE);
        return userProfile;
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        return null;
      } finally {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    })();

    // Store the promise to prevent duplicate requests
    pendingRequests.set(cacheKey, profilePromise);
    return profilePromise;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    // Clear cache for this user
    clearUserCache(user.id);
    
    // Fetch fresh profile
    const freshProfile = await fetchProfile(user.id);
    setProfile(freshProfile);
  }, [user, fetchProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change:", event);
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        // Defer profile fetch to avoid auth deadlocks
        setTimeout(async () => {
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
          setIsLoading(false);
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        // Clear all cached data on signout
        authCache.clear();
        pendingRequests.clear();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then(userProfile => {
          setProfile(userProfile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Session will be updated automatically via onAuthStateChange
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clear cache before signing out
      authCache.clear();
      pendingRequests.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Signed out successfully");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email for verification instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    
    try {
      const updateData = { ...data, id: profile.id };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedProfile = { ...profile, ...data };
      setProfile(updatedProfile);
      
      // Update cache
      setCachedData(`user_${user.id}_profile`, updatedProfile, CACHE_TTL.PROFILE);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, profile]);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isAdmin,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
