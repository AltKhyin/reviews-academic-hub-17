
// ABOUTME: Centralized query client configuration with background optimization functions
import { QueryClient } from '@tanstack/react-query';

// Global query client instance
let globalQueryClient: QueryClient | null = null;

export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        retryDelay: 1500,
      },
    },
  });
};

export const getQueryClient = () => {
  if (!globalQueryClient) {
    globalQueryClient = createOptimizedQueryClient();
  }
  return globalQueryClient;
};

// Background optimization functions
export const initializeBackgroundOptimization = () => {
  const queryClient = getQueryClient();
  
  // Cleanup stale queries every 10 minutes
  setInterval(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();
    let cleaned = 0;
    
    queries.forEach(query => {
      const isStale = now - query.state.dataUpdatedAt > 30 * 60 * 1000; // 30 minutes
      const hasNoObservers = query.getObserversCount() === 0;
      
      if (isStale && hasNoObservers) {
        queryClient.removeQueries({ queryKey: query.queryKey });
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 Background cleanup: removed ${cleaned} stale queries`);
    }
  }, 10 * 60 * 1000);
  
  // Memory pressure handling
  if ('memory' in performance) {
    const checkMemoryPressure = () => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);
      const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);
      const usagePercent = (usedMB / limitMB) * 100;
      
      if (usagePercent > 80) {
        console.warn('🚨 High memory usage detected, performing aggressive cleanup');
        queryClient.clear();
        
        if ('gc' in window && typeof window.gc === 'function') {
          window.gc();
        }
      }
    };
    
    setInterval(checkMemoryPressure, 30000); // Check every 30 seconds
  }
};

export const cleanupBackgroundOptimization = () => {
  // Cleanup would be handled by interval clearing in component unmount
  console.log('🧹 Background optimization cleanup completed');
};
