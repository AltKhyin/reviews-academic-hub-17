
// ABOUTME: Optimized authentication hook with reduced query count and intelligent caching
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedAuthData {
  user: any | null;
  profile: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
  role: string | null;
}

export const useOptimizedAuth = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Consolidated auth query that fetches user permissions in one go
  const { data: authData, isLoading } = useQuery({
    queryKey: queryKeys.userPermissions(user?.id || 'anonymous'),
    queryFn: async (): Promise<OptimizedAuthData> => {
      if (!user) {
        return {
          user: null,
          profile: null,
          isAuthenticated: false,
          isAdmin: false,
          isEditor: false,
          canEdit: false,
          role: null,
        };
      }

      try {
        // Fetch profile data with role information
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, role, full_name, avatar_url, specialty, bio, institution')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn('Profile fetch error:', error);
        }

        const role = profile?.role || 'user';
        const isAdmin = role === 'admin';
        const isEditor = role === 'editor' || isAdmin;
        const canEdit = isEditor;

        return {
          user,
          profile,
          isAuthenticated: true,
          isAdmin,
          isEditor,
          canEdit,
          role,
        };
      } catch (error) {
        console.error('Auth optimization error:', error);
        return {
          user,
          profile: null,
          isAuthenticated: true,
          isAdmin: false,
          isEditor: false,
          canEdit: false,
          role: 'user',
        };
      }
    },
    ...queryConfigs.user,
    enabled: true, // Always enabled to handle both authenticated and anonymous states
    staleTime: user ? 10 * 60 * 1000 : 60 * 60 * 1000, // 10 minutes for auth users, 1 hour for anonymous
  });

  // Provide default values while loading
  const defaultAuthData: OptimizedAuthData = {
    user: null,
    profile: null,
    isAuthenticated: false,
    isAdmin: false,
    isEditor: false,
    canEdit: false,
    role: null,
  };

  return {
    ...((authData || defaultAuthData) as OptimizedAuthData),
    isLoading,
    // Utility functions for permission checking
    hasPermission: (permission: 'read' | 'write' | 'admin') => {
      if (!authData) return false;
      switch (permission) {
        case 'read':
          return authData.isAuthenticated;
        case 'write':
          return authData.canEdit;
        case 'admin':
          return authData.isAdmin;
        default:
          return false;
      }
    },
    // Force refresh auth data
    refreshAuth: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userPermissions(user?.id || 'anonymous') 
      });
    },
  };
};

// Stable auth hook for components that need consistent auth state
export const useStableAuth = () => {
  const authData = useOptimizedAuth();
  
  // Use React Query's built-in state management for stability
  return {
    ...authData,
    // Provide stable loading state to prevent UI flashing
    isLoading: authData.isLoading,
    isReady: !authData.isLoading,
  };
};
