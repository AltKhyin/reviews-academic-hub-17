
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
  };
  lastUpdated: Date;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  intervalMs: number;
  memoryThreshold: number;
  enableAdaptiveInterval: boolean;
}

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

        return data;
      } catch (error) {
        console.error('Query performance fetch error:', error);
        return {
          active_connections: 0,
          cache_hit_ratio: 0,
          slow_queries_detected: false,
          last_updated: new Date().toISOString(),
        };
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

  // Monitor memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }, []);

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
    const renderCount = React.version ? 1 : 0; // Simplified render tracking

    const newMetrics: PerformanceMetrics = {
      memoryUsage,
      renderCount,
      queryPerformance: {
        activeConnections: queryPerformanceData?.active_connections || 0,
        cacheHitRatio: queryPerformanceData?.cache_hit_ratio || 0,
        slowQueriesDetected: queryPerformanceData?.slow_queries_detected || false,
      },
      lastUpdated: new Date(),
    };

    setMetrics(newMetrics);

    // Log memory warnings
    if (memoryUsage > finalConfig.memoryThreshold) {
      console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
    }
  }, [finalConfig, measureMemoryUsage, queryPerformanceData]);

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
    metrics,
    isLoading: queryPerfLoading,
    userActivity,
    config: finalConfig,
  };
};
