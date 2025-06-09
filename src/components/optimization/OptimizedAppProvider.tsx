
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

export const OptimizedAppProvider: React.FC<OptimizedAppProviderProps> = ({
  children,
  enablePerformanceMonitoring = true,
  enableErrorTracking = true,
  enableBackgroundSync = true,
}) => {
  // Initialize optimized query client
  const { queryClient, cacheMetrics } = useOptimizedQueryClient({
    enableBackgroundRefetch: true,
    enableRetries: true,
    maxCacheSize: 150,
    defaultStaleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Initialize performance monitoring
  const { metrics: performanceMetrics, getPerformanceScore } = usePerformanceMonitoring({
    enableMonitoring: enablePerformanceMonitoring,
    intervalMs: 30000, // 30 seconds
  });

  // Initialize error tracking with correct configuration properties
  const { errorMetrics } = useErrorTracking({
    enableConsoleLogging: enableErrorTracking,
    enableRemoteReporting: enableErrorTracking,
    maxErrorHistory: 50,
    reportingThreshold: 5,
  });

  // Global performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Enhanced development logging
      const logInterval = setInterval(() => {
        const performanceScore = getPerformanceScore();
        
        console.group('🚀 App Performance Report');
        console.log('Performance Score:', `${performanceScore}/100`);
        console.log('Cache Metrics:', {
          'Total Queries': cacheMetrics.totalQueries,
          'Active Queries': cacheMetrics.activeQueries,
          'Cache Hit Rate': `${cacheMetrics.hitRate.toFixed(1)}%`,
          'Cache Size': `${cacheMetrics.cacheSize.toFixed(2)}MB`,
        });
        console.log('Performance Metrics:', {
          'LCP': performanceMetrics.lcp ? `${performanceMetrics.lcp.toFixed(2)}ms` : 'N/A',
          'FID': performanceMetrics.fid ? `${performanceMetrics.fid.toFixed(2)}ms` : 'N/A',
          'CLS': performanceMetrics.cls ? performanceMetrics.cls.toFixed(3) : 'N/A',
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
  }, [getPerformanceScore, cacheMetrics, performanceMetrics, errorMetrics]);

  // Performance alerts for critical issues
  useEffect(() => {
    if (errorMetrics.criticalErrors > 0) {
      console.error('🚨 Critical errors detected:', errorMetrics.criticalErrors);
    }
    
    if (performanceMetrics.lcp && performanceMetrics.lcp > 4000) {
      console.warn('⚠️ Poor LCP performance detected:', performanceMetrics.lcp);
    }
    
    if (cacheMetrics.hitRate < 70) {
      console.warn('⚠️ Low cache hit rate:', cacheMetrics.hitRate);
    }
  }, [errorMetrics.criticalErrors, performanceMetrics.lcp, cacheMetrics.hitRate]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
