
// ABOUTME: Performance monitoring hook for Core Web Vitals and system metrics
import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  pageLoadTime?: number;
  memoryUsage: number;
  networkLatency: number;
  queryPerformance?: {
    averageQueryTime: number;
    slowQueries: number;
  };
}

interface PerformanceMonitoringOptions {
  enableMonitoring?: boolean;
  intervalMs?: number;
}

export const usePerformanceMonitoring = (options: PerformanceMonitoringOptions = {}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    networkLatency: 0,
  });

  const updateMetrics = useCallback(() => {
    // Memory usage (if available)
    const memoryUsage = (performance as any).memory ? 
      (performance as any).memory.usedJSHeapSize / 1048576 : 0; // Convert to MB

    // Basic network latency estimation
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const networkLatency = navigationTiming ? 
      navigationTiming.responseStart - navigationTiming.requestStart : 0;

    // Page load time - fix the property name
    const pageLoadTime = navigationTiming ? 
      navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;

    setMetrics(prev => ({
      ...prev,
      memoryUsage,
      networkLatency,
      pageLoadTime,
    }));
  }, []);

  // Performance score calculation
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    if (metrics.lcp && metrics.lcp > 2500) score -= 20;
    if (metrics.fid && metrics.fid > 100) score -= 15;
    if (metrics.cls && metrics.cls > 0.1) score -= 15;
    if (metrics.memoryUsage > 100) score -= 20;
    if (metrics.networkLatency > 1000) score -= 15;
    
    return Math.max(0, score);
  }, [metrics]);

  useEffect(() => {
    if (!options.enableMonitoring) return;

    const interval = setInterval(updateMetrics, options.intervalMs || 30000);
    
    // Initial update
    updateMetrics();
    
    return () => clearInterval(interval);
  }, [options.enableMonitoring, options.intervalMs, updateMetrics]);

  return {
    metrics,
    getPerformanceScore,
  };
};
