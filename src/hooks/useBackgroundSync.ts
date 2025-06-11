
// ABOUTME: Background synchronization hook for prefetching and cache management
import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface BackgroundSyncConfig {
  enablePrefetch: boolean;
  enablePeriodicSync: boolean;
  enableVisibilitySync: boolean;
  prefetchCriticalData: boolean;
}

export const useBackgroundSync = (config: BackgroundSyncConfig) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();
  const isEnabled = config.enablePrefetch || config.enablePeriodicSync;

  const triggerSync = useCallback(async () => {
    if (!isEnabled) return;

    try {
      // Prefetch critical queries
      if (config.prefetchCriticalData) {
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['sidebar', 'stats'],
            staleTime: 15 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['issues', 'featured'],
            staleTime: 15 * 60 * 1000,
          }),
        ]);
      }

      console.log('🔄 Background sync completed');
    } catch (error) {
      console.warn('Background sync failed:', error);
    }
  }, [isEnabled, config.prefetchCriticalData, queryClient]);

  // Set up periodic sync
  useEffect(() => {
    if (!config.enablePeriodicSync) return;

    intervalRef.current = setInterval(() => {
      triggerSync();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config.enablePeriodicSync, triggerSync]);

  // Set up visibility change sync
  useEffect(() => {
    if (!config.enableVisibilitySync) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        triggerSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [config.enableVisibilitySync, triggerSync]);

  return {
    triggerSync,
    isEnabled,
  };
};
