// ABOUTME: Comprehensive performance monitoring system with Core Web Vitals and query tracking
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Custom metrics
  pageLoadTime: number;
  memoryUsage: number;
  networkLatency: number;
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
}

interface NavigationTiming {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  processing: number;
  load: number;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    queryPerformance: {
      averageQueryTime: 0,
      slowQueries: 0,
      totalQueries: 0,
    },
  });

  const queryTimesRef = useRef<number[]>([]);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Monitor Core Web Vitals
  const setupWebVitalsMonitoring = useCallback(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    // Clean up existing observer
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
    }

    performanceObserverRef.current = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ 
              ...prev, 
              fid: (entry as PerformanceEventTiming).processingStart - entry.startTime 
            }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }));
            }
            break;
        }
      }
    });

    try {
      performanceObserverRef.current.observe({ 
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }
  }, []);

  // Get navigation timing metrics
  const getNavigationTiming = useCallback((): NavigationTiming | null => {
    if (typeof window === 'undefined' || !window.performance) return null;

    const timing = window.performance.timing;
    
    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      processing: timing.domContentLoadedEventStart - timing.responseEnd,
      load: timing.loadEventEnd - timing.loadEventStart,
    };
  }, []);

  // Track query performance
  const trackQueryPerformance = useCallback((duration: number) => {
    queryTimesRef.current.push(duration);
    
    // Keep only last 100 queries
    if (queryTimesRef.current.length > 100) {
      queryTimesRef.current = queryTimesRef.current.slice(-100);
    }

    const averageQueryTime = queryTimesRef.current.reduce((sum, time) => sum + time, 0) / queryTimesRef.current.length;
    const slowQueries = queryTimesRef.current.filter(time => time > 1000).length;

    setMetrics(prev => ({
      ...prev,
      queryPerformance: {
        averageQueryTime,
        slowQueries,
        totalQueries: queryTimesRef.current.length,
      },
    }));
  }, []);

  // Get memory usage
  const updateMemoryUsage = useCallback(() => {
    if (typeof window === 'undefined') return;

    const memory = (performance as any).memory;
    if (memory) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / (1024 * 1024), // Convert to MB
      }));
    }
  }, []);

  // Calculate overall performance score
  const getPerformanceScore = useCallback((): number => {
    let score = 100;

    // LCP scoring (good < 2.5s, poor > 4s)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 25;
      else if (metrics.lcp > 2500) score -= 15;
    }

    // FID scoring (good < 100ms, poor > 300ms)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 20;
      else if (metrics.fid > 100) score -= 10;
    }

    // CLS scoring (good < 0.1, poor > 0.25)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 20;
      else if (metrics.cls > 0.1) score -= 10;
    }

    // Query performance
    if (metrics.queryPerformance.averageQueryTime > 2000) score -= 15;
    else if (metrics.queryPerformance.averageQueryTime > 1000) score -= 10;

    // Memory usage (penalize high usage)
    if (metrics.memoryUsage > 200) score -= 10;
    else if (metrics.memoryUsage > 100) score -= 5;

    return Math.max(0, score);
  }, [metrics]);

  // Query database performance metrics
  const { data: dbMetrics } = useOptimizedQuery(
    ['performance-metrics'],
    async () => {
      const { data, error } = await supabase.rpc('get_performance_metrics');
      if (error) throw error;
      return data;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Setup monitoring on mount
  useEffect(() => {
    setupWebVitalsMonitoring();
    updateMemoryUsage();

    // Update memory usage periodically
    const memoryInterval = setInterval(updateMemoryUsage, 30000);

    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      clearInterval(memoryInterval);
    };
  }, [setupWebVitalsMonitoring, updateMemoryUsage]);

  // Update page load time
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: performance.now(),
      }));
    }
  }, []);

  return {
    metrics,
    dbMetrics,
    trackQueryPerformance,
    getPerformanceScore,
    getNavigationTiming,
  };
};
