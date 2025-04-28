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

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, bio, specialty, institution')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      if (data) {
        console.log("Profile found:", data);
        setProfile(data as UserProfile);
        
        setIsAdmin(data.role === 'admin');
        setIsEditor(data.role === 'admin' || data.role === 'editor');
        console.log("Role flags set - Admin:", data.role === 'admin', "Editor:", data.role === 'admin' || data.role === 'editor');
      } else {
        console.log("No profile found, creating default");
        const defaultProfileData = {
          id: userId,
          role: 'user',
          full_name: null,
          avatar_url: null
        } as UserProfile;
        
        await supabase
          .from('profiles')
          .insert(defaultProfileData);
          
        setProfile(defaultProfileData);
        setIsAdmin(false);
        setIsEditor(false);
      }
    } catch (error: any) {
      console.error('Error in profile handling:', error);
      setProfile({
        id: userId,
        role: 'user',
        full_name: null,
        avatar_url: null
      });
      setIsAdmin(false);
      setIsEditor(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change:", event, currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        setTimeout(() => {
          fetchProfile(currentSession.user.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsAdmin(false);
        setIsEditor(false);
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
