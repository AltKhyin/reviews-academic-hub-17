
// ABOUTME: Advanced performance monitoring hook for Core Web Vitals and query performance tracking
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  
  // Custom Metrics
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    failedQueries: number;
    cacheHitRate: number;
  };
  
  // Resource Metrics
  memoryUsage: number | null;
  bundleSize: number | null;
  networkLatency: number | null;
  
  // User Experience
  timeToInteractive: number | null;
  pageLoadTime: number | null;
}

interface PerformanceMonitoringConfig {
  enableCoreWebVitals?: boolean;
  enableQueryTracking?: boolean;
  enableResourceTracking?: boolean;
  reportingInterval?: number;
  slowQueryThreshold?: number;
}

const defaultConfig: PerformanceMonitoringConfig = {
  enableCoreWebVitals: true,
  enableQueryTracking: true,
  enableResourceTracking: true,
  reportingInterval: 30000, // 30 seconds
  slowQueryThreshold: 1000, // 1 second
};

export const usePerformanceMonitoring = (config: PerformanceMonitoringConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const queryClient = useQueryClient();
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    queryPerformance: {
      averageQueryTime: 0,
      slowQueries: 0,
      failedQueries: 0,
      cacheHitRate: 0,
    },
    memoryUsage: null,
    bundleSize: null,
    networkLatency: null,
    timeToInteractive: null,
    pageLoadTime: null,
  });

  const performanceBuffer = useRef<{
    queryTimes: number[];
    queryErrors: number;
    cacheHits: number;
    cacheMisses: number;
    lastReportTime: number;
  }>({
    queryTimes: [],
    queryErrors: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lastReportTime: Date.now(),
  });

  // Core Web Vitals monitoring
  const measureCoreWebVitals = useCallback(() => {
    if (!finalConfig.enableCoreWebVitals) return;

    // Use Performance Observer API for accurate measurements
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP measurement not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              setMetrics(prev => ({ ...prev, fid }));
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID measurement not supported:', error);
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS measurement not supported:', error);
      }
    }

    // Navigation Timing API for page load metrics
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        const timeToInteractive = navigation.domInteractive - navigation.fetchStart;
        
        setMetrics(prev => ({
          ...prev,
          pageLoadTime,
          timeToInteractive,
        }));
      }
    }
  }, [finalConfig.enableCoreWebVitals]);

  // Query performance tracking
  const trackQueryPerformance = useCallback(() => {
    if (!finalConfig.enableQueryTracking) return;

    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    let totalQueries = 0;
    let cacheHits = 0;
    let slowQueries = 0;
    
    queries.forEach(query => {
      totalQueries++;
      
      // Check if query was served from cache
      const timeSinceLastFetch = Date.now() - query.state.dataUpdatedAt;
      const staleTime = query.options.staleTime || 0;
      
      if (timeSinceLastFetch < staleTime) {
        cacheHits++;
      }
      
      // Track slow queries (simplified approximation)
      if (query.state.error || query.state.fetchStatus === 'fetching') {
        // This is a rough approximation - in production you'd want more precise timing
        if (query.state.fetchFailureCount > 0) {
          slowQueries++;
        }
      }
    });
    
    const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      queryPerformance: {
        ...prev.queryPerformance,
        cacheHitRate,
        slowQueries,
      },
    }));
  }, [finalConfig.enableQueryTracking, queryClient, finalConfig.slowQueryThreshold]);

  // Resource monitoring
  const measureResourceMetrics = useCallback(() => {
    if (!finalConfig.enableResourceTracking) return;

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }

    // Bundle size estimation from resource timing
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalBundleSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalBundleSize += resource.transferSize || 0;
        }
      });
      
      if (totalBundleSize > 0) {
        const bundleSizeMB = totalBundleSize / (1024 * 1024);
        setMetrics(prev => ({ ...prev, bundleSize: bundleSizeMB }));
      }
    }

    // Network latency estimation
    const connection = (navigator as any).connection;
    if (connection && connection.rtt) {
      setMetrics(prev => ({ ...prev, networkLatency: connection.rtt }));
    }
  }, [finalConfig.enableResourceTracking]);

  // Performance reporting
  const reportMetrics = useCallback(() => {
    const currentTime = Date.now();
    const timeSinceLastReport = currentTime - performanceBuffer.current.lastReportTime;
    
    if (timeSinceLastReport >= finalConfig.reportingInterval!) {
      // Calculate averages from buffer
      const { queryTimes, queryErrors } = performanceBuffer.current;
      
      const averageQueryTime = queryTimes.length > 0 
        ? queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length 
        : 0;
      
      setMetrics(prev => ({
        ...prev,
        queryPerformance: {
          ...prev.queryPerformance,
          averageQueryTime,
          failedQueries: queryErrors,
        },
      }));
      
      // Reset buffer
      performanceBuffer.current = {
        queryTimes: [],
        queryErrors: 0,
        cacheHits: 0,
        cacheMisses: 0,
        lastReportTime: currentTime,
      };
      
      // Log performance report (in development)
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 Performance Report');
        console.log('Core Web Vitals:', {
          LCP: metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A',
          FID: metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A',
          CLS: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
        });
        console.log('Query Performance:', {
          'Avg Query Time': `${averageQueryTime.toFixed(2)}ms`,
          'Cache Hit Rate': `${metrics.queryPerformance.cacheHitRate.toFixed(1)}%`,
          'Slow Queries': metrics.queryPerformance.slowQueries,
          'Failed Queries': queryErrors,
        });
        console.log('Resource Metrics:', {
          'Memory Usage': metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(2)}MB` : 'N/A',
          'Bundle Size': metrics.bundleSize ? `${metrics.bundleSize.toFixed(2)}MB` : 'N/A',
          'Network Latency': metrics.networkLatency ? `${metrics.networkLatency}ms` : 'N/A',
        });
        console.groupEnd();
      }
    }
  }, [finalConfig.reportingInterval, metrics]);

  // Initialize monitoring
  useEffect(() => {
    measureCoreWebVitals();
    
    const measurementInterval = setInterval(() => {
      trackQueryPerformance();
      measureResourceMetrics();
      reportMetrics();
    }, 5000); // Measure every 5 seconds
    
    return () => clearInterval(measurementInterval);
  }, [measureCoreWebVitals, trackQueryPerformance, measureResourceMetrics, reportMetrics]);

  // Public API for manual measurements
  const measureNow = useCallback(() => {
    measureCoreWebVitals();
    trackQueryPerformance();
    measureResourceMetrics();
  }, [measureCoreWebVitals, trackQueryPerformance, measureResourceMetrics]);

  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Deduct points based on Core Web Vitals
    if (metrics.lcp && metrics.lcp > 2500) score -= 20;
    if (metrics.fid && metrics.fid > 100) score -= 15;
    if (metrics.cls && metrics.cls > 0.1) score -= 15;
    
    // Deduct points for query performance
    if (metrics.queryPerformance.cacheHitRate < 80) score -= 10;
    if (metrics.queryPerformance.slowQueries > 5) score -= 10;
    if (metrics.queryPerformance.averageQueryTime > 500) score -= 10;
    
    // Deduct points for resource usage
    if (metrics.memoryUsage && metrics.memoryUsage > 100) score -= 10;
    if (metrics.bundleSize && metrics.bundleSize > 5) score -= 10;
    
    return Math.max(0, score);
  }, [metrics]);

  return {
    metrics,
    measureNow,
    getPerformanceScore,
    isMonitoring: true,
  };
};
