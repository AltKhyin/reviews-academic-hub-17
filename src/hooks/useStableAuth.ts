
// ABOUTME: Stable authentication hook with dependency cycle prevention and error recovery
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserPermissions {
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
  canManageUsers: boolean;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  bio: string | null;
  institution: string | null;
  role: 'user' | 'admin';
}

interface StableAuthState {
  user: UserProfile | null;
  permissions: UserPermissions;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  retry: () => void;
}

const defaultPermissions: UserPermissions = {
  isAdmin: false,
  isEditor: false,
  canEdit: false,
  canManageUsers: false,
};

// Singleton cache to prevent multiple simultaneous auth requests
let authCache: {
  data: UserProfile | null;
  permissions: UserPermissions;
  lastUpdated: number;
  promise: Promise<void> | null;
} = {
  data: null,
  permissions: defaultPermissions,
  lastUpdated: 0,
  promise: null,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useStableAuth = (): StableAuthState => {
  const { user: authUser, session } = useAuth();
  const [state, setState] = useState<{
    user: UserProfile | null;
    permissions: UserPermissions;
    isLoading: boolean;
    error: Error | null;
  }>({
    user: null,
    permissions: defaultPermissions,
    isLoading: true,
    error: null,
  });
  
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchUserData = useCallback(async (userId: string): Promise<void> => {
    // Check cache first
    const now = Date.now();
    if (authCache.data && authCache.data.id === userId && 
        now - authCache.lastUpdated < CACHE_DURATION) {
      setState(prev => ({
        ...prev,
        user: authCache.data,
        permissions: authCache.permissions,
        isLoading: false,
        error: null,
      }));
      return;
    }

    // Prevent multiple simultaneous requests
    if (authCache.promise) {
      await authCache.promise;
      setState(prev => ({
        ...prev,
        user: authCache.data,
        permissions: authCache.permissions,
        isLoading: false,
        error: null,
      }));
      return;
    }

    // Create new request
    authCache.promise = (async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, specialty, bio, institution')
          .eq('id', userId)
          .single();

        if (error) {
          throw new Error(`Profile fetch failed: ${error.message}`);
        }

        const userData: UserProfile = {
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          specialty: profile.specialty,
          bio: profile.bio,
          institution: profile.institution,
          role: profile.role as 'user' | 'admin',
        };

        const permissions: UserPermissions = {
          isAdmin: profile.role === 'admin',
          isEditor: profile.role === 'admin', // Since editor = admin
          canEdit: profile.role === 'admin',
          canManageUsers: profile.role === 'admin',
        };

        // Update cache
        authCache.data = userData;
        authCache.permissions = permissions;
        authCache.lastUpdated = now;

        setState(prev => ({
          ...prev,
          user: userData,
          permissions,
          isLoading: false,
          error: null,
        }));

        retryCountRef.current = 0;
      } catch (error) {
        console.error('Auth data fetch error:', error);
        
        // Fallback to minimal user data
        const fallbackUser: UserProfile = {
          id: userId,
          full_name: null,
          avatar_url: null,
          specialty: null,
          bio: null,
          institution: null,
          role: 'user',
        };

        setState(prev => ({
          ...prev,
          user: fallbackUser,
          permissions: defaultPermissions,
          isLoading: false,
          error: error as Error,
        }));
      } finally {
        authCache.promise = null;
      }
    })();

    await authCache.promise;
  }, []);

  const retry = useCallback(() => {
    if (retryCountRef.current < maxRetries && authUser?.id) {
      retryCountRef.current++;
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Clear cache to force refresh
      authCache.lastUpdated = 0;
      
      fetchUserData(authUser.id);
    }
  }, [authUser?.id, fetchUserData]);

  // Main effect for handling auth state changes
  useEffect(() => {
    if (!authUser || !session) {
      // Clear auth state when user logs out
      setState({
        user: null,
        permissions: defaultPermissions,
        isLoading: false,
        error: null,
      });
      
      // Clear cache
      authCache.data = null;
      authCache.permissions = defaultPermissions;
      authCache.lastUpdated = 0;
      return;
    }

    // User is authenticated, fetch their data
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    fetchUserData(authUser.id);
  }, [authUser?.id, session, fetchUserData]);

  return {
    user: state.user,
    permissions: state.permissions,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    error: state.error,
    retry,
  };
};

// Utility hooks for specific permissions
export const useAuthPermissions = () => {
  const { permissions } = useStableAuth();
  return permissions;
};

export const useAuthUser = () => {
  const { user, isLoading, isAuthenticated } = useStableAuth();
  return { user, isLoading, isAuthenticated };
};
