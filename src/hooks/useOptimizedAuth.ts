
// ABOUTME: Optimized authentication hook with aggressive caching and request deduplication
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useRef, useCallback } from 'react';

interface OptimizedAuthData {
  user: any | null;
  profile: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
  role: string | null;
}

// Global cache to prevent duplicate auth requests
const authCache = new Map();
const pendingAuthRequests = new Map();

export const useOptimizedAuth = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastUserIdRef = useRef<string | null>(null);

  // Deduplicate auth requests using cache key
  const cacheKey = user?.id || 'anonymous';
  
  // Check if request is already pending to prevent duplicates
  const fetchAuthData = useCallback(async (): Promise<OptimizedAuthData> => {
    // Return cached data if available and fresh
    if (authCache.has(cacheKey)) {
      const cached = authCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
        return cached.data;
      }
    }

    // Check for pending request to prevent duplication
    if (pendingAuthRequests.has(cacheKey)) {
      return pendingAuthRequests.get(cacheKey);
    }

    if (!user) {
      const defaultData = {
        user: null,
        profile: null,
        isAuthenticated: false,
        isAdmin: false,
        isEditor: false,
        canEdit: false,
        role: null,
      };
      authCache.set(cacheKey, { data: defaultData, timestamp: Date.now() });
      return defaultData;
    }

    // Create and cache the promise to prevent duplicate requests
    const authPromise = (async () => {
      try {
        // Single optimized query with minimal fields
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, role, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn('Profile fetch error:', error);
        }

        const role = profile?.role || 'user';
        const isAdmin = role === 'admin';
        const isEditor = role === 'editor' || isAdmin;
        const canEdit = isEditor;

        const authData = {
          user,
          profile,
          isAuthenticated: true,
          isAdmin,
          isEditor,
          canEdit,
          role,
        };

        // Cache the result
        authCache.set(cacheKey, { data: authData, timestamp: Date.now() });
        return authData;
      } catch (error) {
        console.error('Auth optimization error:', error);
        const fallbackData = {
          user,
          profile: null,
          isAuthenticated: true,
          isAdmin: false,
          isEditor: false,
          canEdit: false,
          role: 'user',
        };
        authCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
        return fallbackData;
      } finally {
        // Remove from pending requests
        pendingAuthRequests.delete(cacheKey);
      }
    })();

    // Cache the promise to prevent duplicate requests
    pendingAuthRequests.set(cacheKey, authPromise);
    return authPromise;
  }, [user, cacheKey]);

  // Clear cache when user changes
  if (lastUserIdRef.current !== (user?.id || null)) {
    lastUserIdRef.current = user?.id || null;
    authCache.clear();
    pendingAuthRequests.clear();
  }

  const { data: authData, isLoading } = useQuery({
    queryKey: queryKeys.userPermissions(cacheKey),
    queryFn: fetchAuthData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
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
    refreshAuth: () => {
      authCache.delete(cacheKey);
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userPermissions(cacheKey) 
      });
    },
  };
};
