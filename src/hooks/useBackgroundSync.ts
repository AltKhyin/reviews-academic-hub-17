
// ABOUTME: Background synchronization system for critical data prefetching
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundSyncOptions {
  enablePrefetch?: boolean;
  enablePeriodicSync?: boolean;
  enableVisibilitySync?: boolean;
  prefetchCriticalData?: boolean;
}

export const useBackgroundSync = (options: BackgroundSyncOptions = {}) => {
  const queryClient = useQueryClient();
  const {
    enablePrefetch = true,
    enablePeriodicSync = true,
    enableVisibilitySync = true,
    prefetchCriticalData = true,
  } = options;

  // Prefetch critical data on idle
  const prefetchCritical = useCallback(async () => {
    if (!prefetchCriticalData) return;

    // Prefetch sidebar stats (frequently accessed)
    queryClient.prefetchQuery({
      queryKey: ['sidebar', 'stats'],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_sidebar_stats');
        if (error) throw error;
        return data;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Prefetch featured issue (homepage critical)
    queryClient.prefetchQuery({
      queryKey: ['issues', 'featured'],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_featured_issue');
        if (error) throw error;
        return data;
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  }, [queryClient, prefetchCriticalData]);

  // Periodic sync for critical data
  useEffect(() => {
    if (!enablePeriodicSync) return;

    const interval = setInterval(() => {
      // Invalidate critical queries every 5 minutes
      queryClient.invalidateQueries({ 
        queryKey: ['sidebar', 'stats'],
        refetchType: 'none' // Don't refetch immediately, just mark as stale
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient, enablePeriodicSync]);

  // Visibility change sync
  useEffect(() => {
    if (!enableVisibilitySync) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab, prefetch critical data
        prefetchCritical();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableVisibilitySync, prefetchCritical]);

  // Initial prefetch on mount
  useEffect(() => {
    if (enablePrefetch) {
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetchCritical);
      } else {
        setTimeout(prefetchCritical, 100);
      }
    }
  }, [enablePrefetch, prefetchCritical]);

  const triggerSync = useCallback(() => {
    prefetchCritical();
  }, [prefetchCritical]);

  return {
    triggerSync,
    isEnabled: enablePrefetch || enablePeriodicSync || enableVisibilitySync,
  };
};
