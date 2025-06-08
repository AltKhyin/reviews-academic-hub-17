
// ABOUTME: Enhanced background sync with intelligent prefetching and network awareness
import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useStableAuth } from './useStableAuth';

interface BackgroundSyncOptions {
  enablePrefetch?: boolean;
  enablePeriodicSync?: boolean;
  enableVisibilitySync?: boolean;
  prefetchCriticalData?: boolean;
  networkAware?: boolean;
}

const defaultOptions: BackgroundSyncOptions = {
  enablePrefetch: true,
  enablePeriodicSync: true,
  enableVisibilitySync: true,
  prefetchCriticalData: true,
  networkAware: true,
};

// Network condition detection
const getNetworkCondition = () => {
  const connection = (navigator as any).connection;
  if (!connection) return 'unknown';
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    saveData: connection.saveData,
    isSlowConnection: connection.effectiveType === 'slow-2g' || 
                     connection.effectiveType === '2g' ||
                     connection.saveData,
    isFastConnection: connection.effectiveType === '4g' && connection.downlink > 2
  };
};

export const useBackgroundSync = (options: BackgroundSyncOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useStableAuth();
  const lastSyncRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced critical data prefetching with network awareness
  const prefetchCriticalData = useCallback(async (force: boolean = false) => {
    if (!opts.prefetchCriticalData && !force) return;
    
    const networkCondition = opts.networkAware ? getNetworkCondition() : { isSlowConnection: false };
    
    if (networkCondition.isSlowConnection && !force) {
      console.log('Skipping prefetch on slow connection');
      return;
    }
    
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncRef.current;
    const minSyncInterval = 5 * 60 * 1000; // 5 minutes minimum between syncs
    
    if (timeSinceLastSync < minSyncInterval && !force) {
      console.log('Skipping prefetch - too soon since last sync');
      return;
    }
    
    try {
      const prefetchPromises = [
        // Core issues data
        queryClient.prefetchQuery({
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
          staleTime: 20 * 60 * 1000, // 20 minutes
        }),
        
        // Sidebar stats
        queryClient.prefetchQuery({
          queryKey: queryKeys.sidebarStats(),
          queryFn: async () => {
            const [usersResult, issuesResult] = await Promise.allSettled([
              supabase.from('profiles').select('id', { count: 'exact', head: true }),
              supabase.from('issues').select('id, featured', { count: 'exact' }).eq('published', true)
            ]);
            
            return {
              totalUsers: usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0,
              onlineUsers: 0,
              totalIssues: issuesResult.status === 'fulfilled' ? (issuesResult.value.count || 0) : 0,
              featuredIssues: 0,
            };
          },
          staleTime: 15 * 60 * 1000, // 15 minutes
        })
      ];
      
      // Add user-specific prefetching if authenticated
      if (isAuthenticated && user?.id) {
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.userReactions(user.id),
            queryFn: async () => {
              const { data } = await supabase
                .from('user_article_reactions')
                .select('issue_id, reaction_type')
                .eq('user_id', user.id)
                .limit(100);
              return data || [];
            },
            staleTime: 10 * 60 * 1000, // 10 minutes
          })
        );
      }
      
      await Promise.allSettled(prefetchPromises);
      lastSyncRef.current = now;
      
      console.log('Background sync: Critical data prefetched successfully');
    } catch (error) {
      console.error('Background sync: Prefetch failed', error);
    }
  }, [queryClient, opts.prefetchCriticalData, opts.networkAware, isAuthenticated, user?.id]);

  // Intelligent periodic sync with adaptive timing
  const periodicSync = useCallback(() => {
    if (!opts.enablePeriodicSync) return;
    
    const startPeriodicSync = () => {
      const networkCondition = opts.networkAware ? getNetworkCondition() : { isSlowConnection: false };
      
      // Adjust sync frequency based on network conditions
      let interval = 15 * 60 * 1000; // 15 minutes default
      
      if (networkCondition.isSlowConnection) {
        interval = 30 * 60 * 1000; // 30 minutes on slow connections
      } else if ((networkCondition as any).isFastConnection) {
        interval = 10 * 60 * 1000; // 10 minutes on fast connections
      }
      
      const syncOperation = () => {
        const now = Date.now();
        const staleThreshold = 12 * 60 * 1000; // 12 minutes
        
        // Only invalidate truly stale data
        const queriesToRefresh = ['parallel-issues', 'sidebarStats'];
        
        queryClient.getQueryCache().getAll().forEach(query => {
          const queryKeyStr = JSON.stringify(query.queryKey);
          const isStale = query.state.dataUpdatedAt < now - staleThreshold;
          const shouldRefresh = queriesToRefresh.some(key => queryKeyStr.includes(key));
          
          if (isStale && shouldRefresh && query.getObserversCount() > 0) {
            queryClient.invalidateQueries({ queryKey: query.queryKey });
          }
        });
        
        console.log('Background sync: Periodic refresh completed');
      };
      
      // Clear existing interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      
      // Set new interval
      syncIntervalRef.current = setInterval(syncOperation, interval);
      
      console.log(`Background sync: Periodic sync started (interval: ${interval / 1000}s)`);
    };
    
    startPeriodicSync();
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [queryClient, opts.enablePeriodicSync, opts.networkAware]);

  // Enhanced visibility-based sync with debouncing
  const visibilitySync = useCallback(() => {
    if (!opts.enableVisibilitySync) return;
    
    let visibilityTimeout: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      // Clear existing timeout
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      
      if (!document.hidden) {
        // Debounce visibility changes to avoid excessive syncing
        visibilityTimeout = setTimeout(() => {
          const now = Date.now();
          const timeSinceLastSync = now - lastSyncRef.current;
          const minVisibilitySync = 2 * 60 * 1000; // 2 minutes minimum between visibility syncs
          
          if (timeSinceLastSync > minVisibilitySync) {
            // User returned to tab - refresh critical data
            queryClient.invalidateQueries({ queryKey: queryKeys.issues() });
            
            if (user?.id) {
              queryClient.invalidateQueries({ queryKey: queryKeys.userReactions(user.id) });
              queryClient.invalidateQueries({ queryKey: queryKeys.userBookmarks(user.id) });
            }
            
            lastSyncRef.current = now;
            console.log('Background sync: Visibility-based refresh triggered');
          }
        }, 1000); // 1 second debounce
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
    };
  }, [queryClient, user, opts.enableVisibilitySync]);

  // Network status monitoring with intelligent reconnection
  const networkSync = useCallback(() => {
    const handleOnline = () => {
      console.log('Background sync: Network reconnected');
      
      // Wait a bit for network to stabilize
      setTimeout(() => {
        // Refresh critical data when coming back online
        queryClient.invalidateQueries({ queryKey: queryKeys.issues() });
        
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.userPermissions(user.id) });
        }
        
        // Trigger prefetch after reconnection
        prefetchCriticalData(true);
      }, 2000);
    };
    
    const handleOffline = () => {
      console.log('Background sync: Network disconnected');
      // Could implement offline queue here
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient, user, prefetchCriticalData]);

  // Initialize background sync with staggered startup
  useEffect(() => {
    let cleanupFunctions: (() => void)[] = [];
    
    // Stagger initialization to avoid overwhelming the system
    const initializeSync = async () => {
      // Start with prefetching (highest priority)
      if (opts.enablePrefetch) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await prefetchCriticalData();
      }
      
      // Then start periodic sync
      if (opts.enablePeriodicSync) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const cleanup = periodicSync();
        if (cleanup) cleanupFunctions.push(cleanup);
      }
      
      // Then visibility sync
      if (opts.enableVisibilitySync) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const cleanup = visibilitySync();
        if (cleanup) cleanupFunctions.push(cleanup);
      }
      
      // Finally network monitoring
      await new Promise(resolve => setTimeout(resolve, 4000));
      const networkCleanup = networkSync();
      cleanupFunctions.push(networkCleanup);
      
      console.log('Background sync: All systems initialized');
    };
    
    initializeSync();
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [prefetchCriticalData, periodicSync, visibilitySync, networkSync, opts]);

  // Manual sync trigger with force option
  const triggerSync = useCallback(async (force: boolean = false) => {
    console.log('Background sync: Manual sync triggered');
    
    // Force prefetch critical data
    await prefetchCriticalData(force);
    
    // Invalidate key queries
    const criticalQueries = [queryKeys.issues(), queryKeys.sidebarStats()];
    
    await Promise.allSettled(
      criticalQueries.map(queryKey => 
        queryClient.invalidateQueries({ queryKey })
      )
    );
    
    console.log('Background sync: Manual sync completed');
  }, [prefetchCriticalData, queryClient]);

  return {
    triggerSync,
    isEnabled: Object.values(opts).some(Boolean),
    networkCondition: opts.networkAware ? getNetworkCondition() : null,
    lastSync: lastSyncRef.current,
  };
};
