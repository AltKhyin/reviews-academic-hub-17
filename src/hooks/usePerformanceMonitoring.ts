// ABOUTME: Optimized performance monitoring with adaptive intervals and RPC integration
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  memoryUsage: number;
  renderCount: number;
  queryPerformance: {
    activeConnections: number;
    cacheHitRatio: number;
    slowQueriesDetected: boolean;
    averageQueryTime?: number;
  };
  lastUpdated: Date;
  // Core Web Vitals
  lcp?: number;
  fid?: number;
  cls?: number;
  pageLoadTime?: number;
  networkLatency: number;
  userExperience: number;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  intervalMs: number;
  memoryThreshold: number;
  enableAdaptiveInterval: boolean;
}

interface QueryPerformanceData {
  active_connections: number;
  cache_hit_ratio: number;
  slow_queries_detected: boolean;
  last_updated: string;
}

// Type guard for query performance data
const isQueryPerformanceData = (data: unknown): data is QueryPerformanceData => {
  return data !== null && 
         typeof data === 'object' && 
         'active_connections' in data &&
         'cache_hit_ratio' in data &&
         'slow_queries_detected' in data;
};

// Adaptive interval calculation based on performance score
const getAdaptiveInterval = (performanceScore: number, userActivity: 'idle' | 'active' | 'high-load') => {
  if (performanceScore < 70) return 15000; // 15s for poor performance
  if (performanceScore > 90) return 120000; // 2min for excellent performance
  
  // Adjust based on user activity
  switch (userActivity) {
    case 'high-load': return 15000;
    case 'active': return 30000;
    case 'idle': return 60000;
    default: return 60000; // 1min default
  }
};

export const usePerformanceMonitoring = (config: Partial<PerformanceConfig> = {}) => {
  const defaultConfig: PerformanceConfig = {
    enableMonitoring: true,
    intervalMs: 60000, // 1 minute default
    memoryThreshold: 100, // 100MB
    enableAdaptiveInterval: true,
  };

  const finalConfig = { ...defaultConfig, ...config };
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [userActivity, setUserActivity] = useState<'idle' | 'active' | 'high-load'>('idle');
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();

  // Query performance data using RPC function
  const { data: queryPerformanceData, isLoading: queryPerfLoading } = useOptimizedQuery(
    queryKeys.queryPerformance(),
    async () => {
      try {
        const { data, error } = await supabase.rpc('get_query_performance_stats');
        
        if (error) {
          console.error('Error fetching query performance:', error);
          throw error;
        }

        // Type guard for the data
        if (isQueryPerformanceData(data)) {
          return data;
        }

        // Fallback if data structure is unexpected
        return {
          active_connections: 0,
          cache_hit_ratio: 0,
          slow_queries_detected: false,
          last_updated: new Date().toISOString(),
        } as QueryPerformanceData;
      } catch (error) {
        console.error('Query performance fetch error:', error);
        return {
          active_connections: 0,
          cache_hit_ratio: 0,
          slow_queries_detected: false,
          last_updated: new Date().toISOString(),
        } as QueryPerformanceData;
      }
    },
    {
      ...queryConfigs.performance,
      enabled: finalConfig.enableMonitoring,
      refetchInterval: finalConfig.enableAdaptiveInterval 
        ? getAdaptiveInterval(80, userActivity) // Default score of 80
        : finalConfig.intervalMs,
    }
  );

  // Safely access query performance data
  const safeQueryData = isQueryPerformanceData(queryPerformanceData) ? queryPerformanceData : {
    active_connections: 0,
    cache_hit_ratio: 0,
    slow_queries_detected: false,
    last_updated: new Date().toISOString(),
  };

  // Monitor memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }, []);

  // Calculate performance score
  const getPerformanceScore = useCallback(() => {
    if (!metrics) return 80; // Default score
    
    let score = 100;
    
    // Memory usage impact
    if (metrics.memoryUsage > 150) score -= 20;
    else if (metrics.memoryUsage > 100) score -= 10;
    
    // Cache efficiency impact
    if (metrics.queryPerformance.cacheHitRatio < 70) score -= 15;
    else if (metrics.queryPerformance.cacheHitRatio < 85) score -= 5;
    
    // Core Web Vitals impact
    if (metrics.lcp && metrics.lcp > 4000) score -= 20;
    if (metrics.fid && metrics.fid > 300) score -= 15;
    if (metrics.cls && metrics.cls > 0.25) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  // Track user activity for adaptive intervals
  useEffect(() => {
    const updateActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      if (timeSinceLastActivity < 10000) { // 10 seconds
        setUserActivity('high-load');
      } else if (timeSinceLastActivity < 60000) { // 1 minute
        setUserActivity('active');
      } else {
        setUserActivity('idle');
      }
      
      lastActivityRef.current = now;
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Collect performance metrics
  const collectMetrics = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    const memoryUsage = measureMemoryUsage();
    const renderCount = 1; // Simplified render tracking

    // Get Core Web Vitals if available
    let lcp, fid, cls, pageLoadTime;
    
    if ('getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        pageLoadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].loadEventStart;
      }
    }

    const newMetrics: PerformanceMetrics = {
      memoryUsage,
      renderCount,
      queryPerformance: {
        activeConnections: safeQueryData.active_connections,
        cacheHitRatio: safeQueryData.cache_hit_ratio,
        slowQueriesDetected: safeQueryData.slow_queries_detected,
        averageQueryTime: 100, // Default value
      },
      lastUpdated: new Date(),
      lcp,
      fid,
      cls,
      pageLoadTime,
      networkLatency: 0, // Default value
      userExperience: 85, // Default value
    };

    setMetrics(newMetrics);

    // Log memory warnings
    if (memoryUsage > finalConfig.memoryThreshold) {
      console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
    }
  }, [finalConfig, measureMemoryUsage, safeQueryData]);

  // Set up performance collection interval
  useEffect(() => {
    if (!finalConfig.enableMonitoring) return;

    const interval = finalConfig.enableAdaptiveInterval
      ? getAdaptiveInterval(metrics?.queryPerformance.cacheHitRatio || 80, userActivity)
      : finalConfig.intervalMs;

    intervalRef.current = setInterval(collectMetrics, interval);

    // Initial collection
    collectMetrics();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [collectMetrics, finalConfig, userActivity, metrics?.queryPerformance.cacheHitRatio]);

  return {
    metrics: metrics || {
      memoryUsage: 0,
      renderCount: 0,
      queryPerformance: { activeConnections: 0, cacheHitRatio: 0, slowQueriesDetected: false },
      lastUpdated: new Date(),
      networkLatency: 0,
      userExperience: 85,
    },
    isLoading: queryPerfLoading,
    userActivity,
    config: finalConfig,
    getPerformanceScore: () => 80, // Placeholder
  };
};
