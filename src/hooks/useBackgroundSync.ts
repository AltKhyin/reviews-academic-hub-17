
// ABOUTME: Background synchronization system for data prefetching and cache warming
import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface BackgroundSyncConfig {
  enablePrefetch?: boolean;
  enablePeriodicSync?: boolean;
  enableVisibilitySync?: boolean;
  prefetchCriticalData?: boolean;
  syncInterval?: number;
}

const defaultConfig: BackgroundSyncConfig = {
  enablePrefetch: true,
  enablePeriodicSync: true,
  enableVisibilitySync: true,
  prefetchCriticalData: true,
  syncInterval: 5 * 60 * 1000, // 5 minutes
};

export const useBackgroundSync = (config: BackgroundSyncConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Critical data queries that should be kept fresh
  const criticalQueries = [
    ['parallel-issues'],
    ['sidebarStats'],
    ['archive-issues', false],
    ['userPermissions'],
  ];

  // Prefetch critical data
  const prefetchCriticalData = useCallback(async () => {
    if (!finalConfig.prefetchCriticalData) return;

    try {
      const results = await Promise.allSettled(
        criticalQueries.map(queryKey =>
          queryClient.prefetchQuery({
            queryKey,
            staleTime: 10 * 60 * 1000, // 10 minutes
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`🔄 Background sync: ${successful}/${criticalQueries.length} queries prefetched`);
      
      setLastSyncTime(Date.now());
    } catch (error) {
      console.warn('Background prefetch failed:', error);
    }
  }, [finalConfig.prefetchCriticalData, queryClient]);

  // Periodic background sync
  useEffect(() => {
    if (!finalConfig.enablePeriodicSync || !isEnabled) return;

    syncIntervalRef.current = setInterval(() => {
      prefetchCriticalData();
    }, finalConfig.syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [finalConfig.enablePeriodicSync, finalConfig.syncInterval, isEnabled, prefetchCriticalData]);

  // Visibility change sync
  useEffect(() => {
    if (!finalConfig.enableVisibilitySync) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && isEnabled) {
        // Page became visible, sync data
        prefetchCriticalData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [finalConfig.enableVisibilitySync, isEnabled, prefetchCriticalData]);

  // Manual sync trigger
  const triggerSync = useCallback((force = false) => {
    if (!isEnabled && !force) return;
    prefetchCriticalData();
  }, [isEnabled, prefetchCriticalData]);

  // Enable/disable sync
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      prefetchCriticalData();
    }
  }, [prefetchCriticalData]);

  return {
    isEnabled,
    setEnabled,
    triggerSync,
    lastSyncTime,
  };
};
