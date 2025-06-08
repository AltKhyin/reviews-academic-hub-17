
// ABOUTME: Comprehensive performance monitoring system for detecting bottlenecks and optimization opportunities
import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  pageLoadTime?: number;
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  memoryUsage?: number;
  networkLatency?: number;
}

interface PerformanceConfig {
  enableCoreWebVitals?: boolean;
  enableQueryTracking?: boolean;
  enableResourceTracking?: boolean;
  reportingInterval?: number;
}

const defaultConfig: PerformanceConfig = {
  enableCoreWebVitals: true,
  enableQueryTracking: true,
  enableResourceTracking: true,
  reportingInterval: 60000, // Increased to 60 seconds to reduce overhead
};

export const usePerformanceMonitoring = (config: PerformanceConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryPerformance: {
      averageQueryTime: 0,
      slowQueries: 0,
      totalQueries: 0,
    },
  });
  
  const metricsRef = useRef<PerformanceMetrics>(metrics);
  const reportingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const observersRef = useRef<PerformanceObserver[]>([]);

  // Core Web Vitals tracking with optimized observers
  const trackCoreWebVitals = useCallback(() => {
    if (!finalConfig.enableCoreWebVitals || typeof window === 'undefined') return;

    // Cleanup existing observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current = [];

    if ('PerformanceObserver' in window) {
      try {
        // Track LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          setMetrics(prev => ({ 
            ...prev, 
            lcp: lastEntry.startTime 
          }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.push(lcpObserver);

        // Track FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({ 
              ...prev, 
              fid: entry.processingStart - entry.startTime 
            }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        observersRef.current.push(fidObserver);

        // Track CLS (Cumulative Layout Shift) with debouncing
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          // Debounced update
          setMetrics(prev => ({ 
            ...prev, 
            cls: clsValue 
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.push(clsObserver);

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Track page load time (one-time measurement)
    if (performance.timing && !metricsRef.current.pageLoadTime) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
    }
  }, [finalConfig.enableCoreWebVitals]);

  // Optimized query performance tracking
  const trackQueryPerformance = useCallback(() => {
    if (!finalConfig.enableQueryTracking) return;

    try {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      let totalTime = 0;
      let slowQueries = 0;
      const validQueries = queries.filter(q => q.state.dataUpdatedAt > 0);
      
      if (validQueries.length === 0) return;

      validQueries.forEach(query => {
        // More accurate query time calculation
        const fetchTime = query.state.dataUpdatedAt - (query.state.fetchStatus === 'fetching' ? Date.now() - 5000 : query.state.dataUpdatedAt);
        if (fetchTime > 0 && fetchTime < 30000) { // Reasonable bounds
          totalTime += fetchTime;
          if (fetchTime > 3000) { // Consider queries > 3s as slow
            slowQueries++;
          }
        }
      });

      const averageQueryTime = totalTime / validQueries.length;
      
      setMetrics(prev => ({
        ...prev,
        queryPerformance: {
          averageQueryTime,
          slowQueries,
          totalQueries: validQueries.length,
        },
      }));
    } catch (error) {
      console.warn('Query performance tracking error:', error);
    }
  }, [finalConfig.enableQueryTracking, queryClient]);

  // Resource monitoring with error handling
  const trackResourceMetrics = useCallback(() => {
    if (!finalConfig.enableResourceTracking || typeof window === 'undefined') return;

    try {
      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / (1024 * 1024), // Convert to MB
        }));
      }

      // Network timing
      if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType('navigation') as any[];
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          const networkLatency = navEntry.responseStart - navEntry.requestStart;
          if (networkLatency > 0) {
            setMetrics(prev => ({
              ...prev,
              networkLatency,
            }));
          }
        }
      }
    } catch (error) {
      console.warn('Resource metrics tracking error:', error);
    }
  }, [finalConfig.enableResourceTracking]);

  // Initialize performance tracking with cleanup
  useEffect(() => {
    trackCoreWebVitals();
    trackQueryPerformance();
    trackResourceMetrics();

    // Set up periodic reporting with reduced frequency
    if (finalConfig.reportingInterval && finalConfig.reportingInterval > 0) {
      reportingIntervalRef.current = setInterval(() => {
        trackQueryPerformance();
        trackResourceMetrics();
      }, finalConfig.reportingInterval);
    }

    return () => {
      // Cleanup observers
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
      
      if (reportingIntervalRef.current) {
        clearInterval(reportingIntervalRef.current);
      }
    };
  }, [trackCoreWebVitals, trackQueryPerformance, trackResourceMetrics, finalConfig.reportingInterval]);

  // Update metrics ref
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Performance score calculation
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // LCP scoring (0-100 based on thresholds)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 25;
      else if (metrics.lcp > 2500) score -= 15;
      else if (metrics.lcp > 1200) score -= 5;
    }
    
    // FID scoring
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 20;
      else if (metrics.fid > 100) score -= 10;
      else if (metrics.fid > 50) score -= 5;
    }
    
    // CLS scoring
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 20;
      else if (metrics.cls > 0.1) score -= 10;
      else if (metrics.cls > 0.05) score -= 5;
    }
    
    // Query performance scoring
    if (metrics.queryPerformance.averageQueryTime > 3000) score -= 15;
    else if (metrics.queryPerformance.averageQueryTime > 1000) score -= 8;
    
    if (metrics.queryPerformance.slowQueries > 3) score -= 10;
    
    // Memory usage scoring
    if (metrics.memoryUsage && metrics.memoryUsage > 150) score -= 10;
    
    return Math.max(0, score);
  }, [metrics]);

  // Performance alerts with reduced noise
  const getPerformanceAlerts = useCallback(() => {
    const alerts = [];
    
    if (metrics.lcp && metrics.lcp > 4000) {
      alerts.push('LCP is over 4 seconds - consider optimizing images and reducing render-blocking resources');
    }
    
    if (metrics.fid && metrics.fid > 300) {
      alerts.push('FID is high - consider reducing JavaScript execution time');
    }
    
    if (metrics.cls && metrics.cls > 0.25) {
      alerts.push('CLS is high - ensure images and ads have dimensions specified');
    }
    
    if (metrics.queryPerformance.slowQueries > 5) {
      alerts.push(`${metrics.queryPerformance.slowQueries} slow queries detected - consider query optimization`);
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > 200) {
      alerts.push('High memory usage detected - check for memory leaks');
    }
    
    return alerts;
  }, [metrics]);

  return {
    metrics,
    getPerformanceScore,
    getPerformanceAlerts,
    trackQueryPerformance,
    trackResourceMetrics,
  };
};
