
// ABOUTME: Comprehensive app optimization provider that integrates all performance enhancements
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimizedQueryClient } from '@/hooks/useOptimizedQueryClient';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useErrorTracking } from '@/hooks/useErrorTracking';

interface OptimizedAppProviderProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
  enableErrorTracking?: boolean;
  enableBackgroundSync?: boolean;
}

// Create optimized query client outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const OptimizedAppProvider: React.FC<OptimizedAppProviderProps> = ({
  children,
  enablePerformanceMonitoring = true,
  enableErrorTracking = true,
  enableBackgroundSync = true,
}) => {
  // Initialize cache optimization
  const { cacheMetrics, optimizeCache, prefetchCriticalData, calculateCacheMetrics } = useOptimizedQueryClient({
    maxCacheSize: 150,
    cleanupInterval: 300000, // 5 minutes
    staleCacheThreshold: 600000, // 10 minutes
  });

  // Initialize performance monitoring
  const { metrics: performanceMetrics } = usePerformanceMonitoring();

  // Initialize error tracking
  const { errorMetrics } = useErrorTracking();

  // Global performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Enhanced development logging
      const logInterval = setInterval(() => {
        console.group('🚀 App Performance Report');
        console.log('Cache Metrics:', {
          'Total Queries': cacheMetrics.totalQueries,
          'Active Queries': cacheMetrics.activeQueries,
          'Cache Hit Rate': `${cacheMetrics.hitRate.toFixed(1)}%`,
          'Cache Size': cacheMetrics.cacheSize,
        });
        console.log('Performance Metrics:', {
          'Page Load': performanceMetrics.pageLoadTime ? `${performanceMetrics.pageLoadTime.toFixed(2)}ms` : 'N/A',
        });
        console.log('Error Metrics:', {
          'Total Errors': errorMetrics.totalErrors,
          'Critical Errors': errorMetrics.criticalErrors,
          'Error Rate': `${errorMetrics.errorRate.toFixed(2)}/min`,
        });
        console.groupEnd();
      }, 60000); // Every minute in development
      
      return () => clearInterval(logInterval);
    }
  }, [cacheMetrics, performanceMetrics, errorMetrics]);

  // Performance alerts for critical issues
  useEffect(() => {
    if (errorMetrics.criticalErrors > 0) {
      console.error('🚨 Critical errors detected:', errorMetrics.criticalErrors);
    }
    
    if (cacheMetrics.hitRate < 70) {
      console.warn('⚠️ Low cache hit rate:', cacheMetrics.hitRate);
    }
  }, [errorMetrics.criticalErrors, cacheMetrics.hitRate]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
