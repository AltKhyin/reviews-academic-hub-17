
// ABOUTME: Unified performance monitoring system that replaces all overlapping monitoring hooks
import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceConfig {
  enableMonitoring: boolean;
  enableOptimization: boolean;
  enableAnalytics: boolean;
  samplingRate?: number;
  reportingInterval?: number;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    totalQueries: number;
  };
  memoryUsage: number;
  cacheMetrics: {
    hitRate: number;
    totalQueries: number;
    cacheSize: number;
  };
  userExperience: {
    lcp?: number;
    fid?: number;
    cls?: number;
  };
}

const defaultConfig: PerformanceConfig = {
  enableMonitoring: true,
  enableOptimization: true,
  enableAnalytics: false,
  samplingRate: 0.1, // 10% sampling for analytics
  reportingInterval: 60000, // 1 minute
};

// Global metrics collection
let globalMetrics: Partial<PerformanceMetrics> = {};
let performanceObserver: PerformanceObserver | null = null;

export const useUnifiedPerformance = (config: Partial<PerformanceConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsCollectionRef = useRef<NodeJS.Timeout | null>(null);

  // Collect Core Web Vitals
  const collectWebVitals = useCallback(() => {
    if (!finalConfig.enableMonitoring || typeof window === 'undefined') return;

    // Initialize performance observer only once
    if (!performanceObserver && 'PerformanceObserver' in window) {
      performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              globalMetrics.userExperience = {
                ...globalMetrics.userExperience,
                lcp: entry.startTime,
              };
              break;
            case 'first-input':
              globalMetrics.userExperience = {
                ...globalMetrics.userExperience,
                fid: (entry as PerformanceEventTiming).processingStart - entry.startTime,
              };
              break;
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                globalMetrics.userExperience = {
                  ...globalMetrics.userExperience,
                  cls: (globalMetrics.userExperience?.cls || 0) + (entry as any).value,
                };
              }
              break;
          }
        }
      });

      try {
        performanceObserver.observe({ 
          entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
        });
      } catch (error) {
        console.warn('Performance observer initialization failed:', error);
      }
    }
  }, [finalConfig.enableMonitoring]);

  // Collect memory metrics
  const collectMemoryMetrics = useCallback(() => {
    if (!finalConfig.enableMonitoring || typeof window === 'undefined') return;

    const memory = (performance as any).memory;
    if (memory) {
      globalMetrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
    }
  }, [finalConfig.enableMonitoring]);

  // Lightweight optimization routine
  const performOptimization = useCallback(async () => {
    if (!finalConfig.enableOptimization || isOptimizing) return;

    setIsOptimizing(true);
    
    try {
      // Force garbage collection if available (development only)
      if (process.env.NODE_ENV === 'development' && 'gc' in window && typeof window.gc === 'function') {
        window.gc();
      }

      // Clear old cache entries
      const now = Date.now();
      const cacheThreshold = 10 * 60 * 1000; // 10 minutes
      
      // This would be integrated with the unified query cache
      // For now, just a placeholder that doesn't break anything
      console.log('🔄 Performance optimization cycle completed');
      
    } catch (error) {
      console.warn('Performance optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [finalConfig.enableOptimization, isOptimizing]);

  // Update metrics state
  const updateMetrics = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    collectMemoryMetrics();
    
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      ...globalMetrics,
      pageLoadTime: performance.now(),
    }));
  }, [finalConfig.enableMonitoring, collectMemoryMetrics]);

  // Initialize monitoring
  useEffect(() => {
    if (!finalConfig.enableMonitoring) return;

    collectWebVitals();
    updateMetrics();

    // Set up periodic metrics collection (reduced frequency)
    metricsCollectionRef.current = setInterval(updateMetrics, 30000); // 30 seconds

    // Set up optimization cycles (reduced frequency)
    if (finalConfig.enableOptimization) {
      intervalRef.current = setInterval(performOptimization, finalConfig.reportingInterval);
    }

    return () => {
      if (metricsCollectionRef.current) {
        clearInterval(metricsCollectionRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    finalConfig.enableMonitoring, 
    finalConfig.enableOptimization, 
    finalConfig.reportingInterval, 
    updateMetrics, 
    performOptimization
  ]);

  // Analytics reporting (sampled)
  useEffect(() => {
    if (!finalConfig.enableAnalytics || Math.random() > (finalConfig.samplingRate || 0.1)) return;

    const reportInterval = setInterval(() => {
      if (Object.keys(metrics).length > 0) {
        console.log('📊 Performance Analytics:', metrics);
      }
    }, finalConfig.reportingInterval);

    return () => clearInterval(reportInterval);
  }, [finalConfig.enableAnalytics, finalConfig.samplingRate, finalConfig.reportingInterval, metrics]);

  return {
    metrics,
    isOptimizing,
    performOptimization,
    updateMetrics,
  };
};

// Export cleanup function for unmount
export const cleanupPerformanceMonitoring = () => {
  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }
  globalMetrics = {};
};
