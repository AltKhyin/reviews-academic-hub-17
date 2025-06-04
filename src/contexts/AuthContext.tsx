
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from '@/types/issue';

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
  isEditor: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      console.log("Checking admin status for user:", userId);
      
      // Use maybeSingle() to avoid errors when no record exists
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log("Admin check result:", { adminData, adminError });
      
      if (adminError) {
        console.error("Admin check error:", adminError);
        return false;
      }
      
      return adminData !== null;
    } catch (error) {
      console.error("Exception in admin check:", error);
      return false;
    }
  };

  const fetchProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      console.log(`Fetching profile for user: ${userId} (attempt ${retryCount + 1})`);
      
      // Check admin status first with error isolation
      const isUserAdmin = await checkAdminStatus(userId);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log("Profile fetch result:", { profileData, profileError });
      
      if (profileError) {
        throw profileError;
      }
      
      if (profileData) {
        // Ensure role is properly typed
        const validRole = (['user', 'editor', 'admin'].includes(profileData.role)) 
          ? profileData.role as 'user' | 'editor' | 'admin'
          : 'user';
          
        const isUserEditor = validRole === 'editor' || isUserAdmin;
        
        console.log("Setting role flags:", { isAdmin: isUserAdmin, isEditor: isUserEditor, role: validRole });
        
        const typedProfile: UserProfile = {
          ...profileData,
          role: validRole
        };
        
        setProfile(typedProfile);
        setIsAdmin(isUserAdmin);
        setIsEditor(isUserEditor);
      } else {
        console.log("No profile found, creating default");
        const defaultProfile: UserProfile = {
          id: userId,
          role: 'user',
          full_name: null,
          avatar_url: null
        };
        
        // Try to create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);
          
        if (insertError) {
          console.error("Error creating default profile:", insertError);
        }
          
        setProfile(defaultProfile);
        setIsAdmin(isUserAdmin);
        setIsEditor(isUserAdmin); // Admin is also editor
      }
    } catch (error: any) {
      console.error(`Error in profile handling (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for transient errors
      if (retryCount < maxRetries && error.code !== '42P17') {
        console.log(`Retrying profile fetch in 2 seconds...`);
        setTimeout(() => {
          fetchProfile(userId, retryCount + 1);
        }, 2000);
        return;
      }
      
      // Set a basic profile in case of persistent error
      const fallbackProfile: UserProfile = {
        id: userId,
        role: 'user',
        full_name: null,
        avatar_url: null
      };
      
      setProfile(fallbackProfile);
      setIsAdmin(false);
      setIsEditor(false);
      
      // Only show toast for non-RLS errors
      if (error.code !== '42P17') {
        toast({
          title: "Profile Loading Error",
          description: "Some features may not work correctly. Please refresh the page.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change:", event, currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        // Defer profile fetch to avoid auth deadlocks
        setTimeout(() => {
          fetchProfile(currentSession.user.id);
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsAdmin(false);
        setIsEditor(false);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email || "No session");
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
      
      setSession(data.session);
      setUser(data.user);
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
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
      const updateData = { ...data };
      if (!updateData.id) {
        updateData.id = profile.id;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
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
      isEditor,
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

export default AuthContext;
