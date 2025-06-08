
// ABOUTME: Optimized authentication context with reduced database calls and simplified admin/editor logic
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/useOptimizedQuery';

interface UserProfile {
  id: string;
  role: 'user' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  bio: string | null;
  institution: string | null;
}

interface OptimizedAuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean; // Always equals isAdmin
  refreshProfile: () => Promise<void>;
}

const OptimizedAuthContext = createContext<OptimizedAuthContextProps | undefined>(undefined);

export const OptimizedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Simplified role check since admin = editor
  const isAdmin = profile?.role === 'admin';
  const isEditor = isAdmin; // Since they're the same

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, specialty, bio, institution')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        
        // Create default profile if none exists
        const defaultProfile: UserProfile = {
          id: userId,
          role: 'user',
          full_name: null,
          avatar_url: null,
          specialty: null,
          bio: null,
          institution: null,
        };

        // Try to create the profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);

        if (!insertError) {
          setProfile(defaultProfile);
        }
        return;
      }

      const userProfile: UserProfile = {
        id: profileData.id,
        role: profileData.role === 'admin' ? 'admin' : 'user',
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        specialty: profileData.specialty,
        bio: profileData.bio,
        institution: profileData.institution,
      };

      setProfile(userProfile);
      
      // Update query cache
      queryClient.setQueryData(queryKeys.userPermissions(userId), {
        id: userId,
        email: user?.email || '',
        role: userProfile.role,
        profile: userProfile,
        permissions: {
          isAdmin: userProfile.role === 'admin',
          isEditor: userProfile.role === 'admin',
          canEdit: userProfile.role === 'admin',
          canManageUsers: userProfile.role === 'admin',
        },
      });

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      if (error.code !== '42P17') {
        toast({
          title: "Profile Loading Error",
          description: "Some features may not work correctly. Please refresh the page.",
          variant: "destructive"
        });
      }
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change:", event);
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        // Defer profile fetch to avoid auth deadlocks
        setTimeout(() => {
          fetchProfile(currentSession.user.id);
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        // Clear all cached data on signout
        queryClient.clear();
      }
      
      setIsLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
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
  };

  const signOut = async () => {
    try {
      // Clear cache before signing out
      queryClient.clear();
      
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
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
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
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    
    try {
      const updateData = { ...data, id: profile.id };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.userPermissions(user.id) });
      
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
  };

  return (
    <OptimizedAuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isAdmin,
      isEditor,
      refreshProfile
    }}>
      {children}
    </OptimizedAuthContext.Provider>
  );
};

export const useOptimizedAuthContext = () => {
  const context = useContext(OptimizedAuthContext);
  if (context === undefined) {
    throw new Error('useOptimizedAuthContext must be used within an OptimizedAuthProvider');
  }
  return context;
};

