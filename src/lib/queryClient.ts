
// ABOUTME: Enhanced query client configuration with background optimization
import { QueryClient } from '@tanstack/react-query';
import { PerformanceProfiler } from '@/utils/performanceHelpers';

// Performance-optimized query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes (was cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Background optimization system
let backgroundOptimizationInterval: NodeJS.Timeout | null = null;

export const initializeBackgroundOptimization = () => {
  if (backgroundOptimizationInterval) return;
  
  // Periodic cache cleanup every 10 minutes
  backgroundOptimizationInterval = setInterval(() => {
    const queries = queryClient.getQueryCache().getAll();
    const staleQueries = queries.filter(query => 
      query.isStale() && 
      !query.isFetching() &&
      (Date.now() - (query.state.dataUpdatedAt || 0)) > 30 * 60 * 1000 // 30 minutes
    );
    
    if (staleQueries.length > 10) {
      console.log(`🧹 Cleaning up ${staleQueries.length} stale queries`);
      staleQueries.slice(0, -5).forEach(query => {
        queryClient.getQueryCache().remove(query);
      });
    }
  }, 10 * 60 * 1000);
};

export const cleanupBackgroundOptimization = () => {
  if (backgroundOptimizationInterval) {
    clearInterval(backgroundOptimizationInterval);
    backgroundOptimizationInterval = null;
  }
};

// Query performance monitoring
export const createPerformanceQueryWrapper = <TData = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>
) => {
  return async (): Promise<TData> => {
    const operationName = `query-${JSON.stringify(queryKey).substring(0, 50)}`;
    PerformanceProfiler.startMeasurement(operationName);
    
    try {
      const result = await queryFn();
      return result;
    } finally {
      PerformanceProfiler.endMeasurement(operationName);
    }
  };
};
