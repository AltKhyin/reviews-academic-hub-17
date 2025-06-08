
// ABOUTME: Background sync system for critical data prefetching and cache optimization
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from './useOptimizedAuth';

interface BackgroundSyncOptions {
  enablePrefetch?: boolean;
  enablePeriodicSync?: boolean;
  enableVisibilitySync?: boolean;
  prefetchCriticalData?: boolean;
}

const defaultOptions: BackgroundSyncOptions = {
  enablePrefetch: true,
  enablePeriodicSync: true,
  enableVisibilitySync: true,
  prefetchCriticalData: true,
};

export const useBackgroundSync = (options: BackgroundSyncOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  const queryClient = useQueryClient();
  const { user, isAdmin } = useOptimizedAuth();

  // Critical data prefetching
  const prefetchCriticalData = useCallback(async () => {
    if (!opts.prefetchCriticalData) return;
    
    try {
      // Prefetch published issues (most commonly accessed)
      await queryClient.prefetchQuery({
        queryKey: queryKeys.issues(),
        queryFn: async () => {
          const { data } = await supabase
            .from('issues')
            .select('id, title, cover_image_url, specialty, published_at, created_at, featured, published')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(50);
          return data || [];
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
      });

      // Prefetch sidebar configuration
      await queryClient.prefetchQuery({
        queryKey: queryKeys.sidebarConfig(),
        queryFn: async () => {
          // This would fetch sidebar configuration
          return {};
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
      });

      console.log('Background sync: Critical data prefetched');
    } catch (error) {
      console.error('Background sync: Prefetch failed', error);
    }
  }, [queryClient, opts.prefetchCriticalData]);

  // Periodic sync for fresh data
  const periodicSync = useCallback(() => {
    if (!opts.enablePeriodicSync) return;
    
    const syncInterval = setInterval(() => {
      // Invalidate stale data selectively
      const now = Date.now();
      const staleThreshold = 10 * 60 * 1000; // 10 minutes
      
      queryClient.getQueryCache().getAll().forEach(query => {
        const isStale = query.state.dataUpdatedAt < now - staleThreshold;
        const isUserSpecific = query.queryKey.includes(user?.id);
        
        // Only invalidate stale user-specific data or critical public data
        if (isStale && (isUserSpecific || query.queryKey.includes('issues'))) {
          queryClient.invalidateQueries({ queryKey: query.queryKey });
        }
      });
      
      console.log('Background sync: Periodic refresh completed');
    }, 15 * 60 * 1000); // Every 15 minutes
    
    return () => clearInterval(syncInterval);
  }, [queryClient, user?.id, opts.enablePeriodicSync]);

  // Visibility-based sync (when user returns to tab)
  const visibilitySync = useCallback(() => {
    if (!opts.enableVisibilitySync) return;
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab - refresh critical data
        queryClient.invalidateQueries({ queryKey: queryKeys.issues() });
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.userReactions(user.id) });
          queryClient.invalidateQueries({ queryKey: queryKeys.userBookmarks(user.id) });
        }
        console.log('Background sync: Visibility-based refresh');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient, user, opts.enableVisibilitySync]);

  // Cache cleanup and optimization
  const optimizeCache = useCallback(() => {
    const cleanup = () => {
      const cache = queryClient.getQueryCache();
      const now = Date.now();
      const cleanupThreshold = 30 * 60 * 1000; // 30 minutes
      
      cache.getAll().forEach(query => {
        // Remove very old unused queries
        if (query.state.dataUpdatedAt < now - cleanupThreshold && 
            query.getObserversCount() === 0) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
      
      console.log('Background sync: Cache cleanup completed');
    };
    
    // Initial cleanup
    cleanup();
    
    // Periodic cleanup
    const cleanupInterval = setInterval(cleanup, 30 * 60 * 1000); // Every 30 minutes
    return () => clearInterval(cleanupInterval);
  }, [queryClient]);

  // Network status monitoring
  const networkSync = useCallback(() => {
    const handleOnline = () => {
      console.log('Background sync: Network reconnected, refreshing data');
      // Refresh critical data when coming back online
      queryClient.invalidateQueries({ queryKey: queryKeys.issues() });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userPermissions(user.id) });
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient, user]);

  // Initialize background sync
  useEffect(() => {
    let cleanupFunctions: (() => void)[] = [];
    
    // Start prefetching
    if (opts.enablePrefetch) {
      prefetchCriticalData();
    }
    
    // Start periodic sync
    if (opts.enablePeriodicSync) {
      const cleanup = periodicSync();
      if (cleanup) cleanupFunctions.push(cleanup);
    }
    
    // Start visibility sync
    if (opts.enableVisibilitySync) {
      const cleanup = visibilitySync();
      if (cleanup) cleanupFunctions.push(cleanup);
    }
    
    // Start cache optimization
    const cacheCleanup = optimizeCache();
    cleanupFunctions.push(cacheCleanup);
    
    // Start network monitoring
    const networkCleanup = networkSync();
    cleanupFunctions.push(networkCleanup);
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [prefetchCriticalData, periodicSync, visibilitySync, optimizeCache, networkSync, opts]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    console.log('Background sync: Manual sync triggered');
    await prefetchCriticalData();
    queryClient.invalidateQueries({ queryKey: queryKeys.issues() });
  }, [prefetchCriticalData, queryClient]);

  return {
    triggerSync,
    isEnabled: opts.enablePrefetch || opts.enablePeriodicSync || opts.enableVisibilitySync,
  };
};
