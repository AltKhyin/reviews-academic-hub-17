
// ABOUTME: Central performance optimization coordinator that manages all performance systems
import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import { useErrorTracking } from './useErrorTracking';
import { useOptimizedQueryClient } from './useOptimizedQueryClient';

interface PerformanceMetrics {
  cacheEfficiency: number;
  queryPerformance: number;
  errorRate: number;
  memoryUsage: number;
  networkLatency: number;
  userExperience: number;
}

interface OptimizationConfig {
  enableAggressiveCaching?: boolean;
  enableBackgroundPrefetch?: boolean;
  enableMemoryOptimization?: boolean;
  enableNetworkOptimization?: boolean;
  performanceThresholds?: {
    maxMemoryUsage: number;
    maxQueryTime: number;
    maxErrorRate: number;
  };
}

const defaultConfig: OptimizationConfig = {
  enableAggressiveCaching: true,
  enableBackgroundPrefetch: true,
  enableMemoryOptimization: true,
  enableNetworkOptimization: true,
  performanceThresholds: {
    maxMemoryUsage: 150, // MB
    maxQueryTime: 2000, // ms
    maxErrorRate: 0.05, // 5%
  },
};

export const usePerformanceOptimizer = (config: OptimizationConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const queryClient = useQueryClient();
  
  const { metrics: performanceMetrics, getPerformanceScore } = usePerformanceMonitoring();
  const { errorMetrics } = useErrorTracking();
  const { cacheMetrics, optimizeCache } = useOptimizedQueryClient();
  
  const [optimizationState, setOptimizationState] = useState({
    isOptimizing: false,
    lastOptimization: Date.now(),
    optimizationCount: 0,
  });
  
  const optimizationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate composite performance metrics
  const calculateMetrics = useCallback((): PerformanceMetrics => {
    const cacheEfficiency = cacheMetrics.hitRate || 0;
    const queryPerformance = Math.max(0, 100 - ((performanceMetrics.queryPerformance?.averageQueryTime || 100) / 10));
    const errorRate = errorMetrics.errorRate || 0;
    const memoryUsage = performanceMetrics.memoryUsage || 0;
    const networkLatency = performanceMetrics.networkLatency || 0;
    
    // Calculate user experience score based on Core Web Vitals
    let userExperience = 100;
    if (performanceMetrics.lcp && performanceMetrics.lcp > 2500) userExperience -= 20;
    if (performanceMetrics.fid && performanceMetrics.fid > 100) userExperience -= 15;
    if (performanceMetrics.cls && performanceMetrics.cls > 0.1) userExperience -= 15;
    
    return {
      cacheEfficiency,
      queryPerformance,
      errorRate,
      memoryUsage,
      networkLatency,
      userExperience: Math.max(0, userExperience),
    };
  }, [cacheMetrics, performanceMetrics, errorMetrics]);

  // Intelligent optimization strategies
  const performOptimizations = useCallback(async () => {
    if (optimizationState.isOptimizing) return;
    
    setOptimizationState(prev => ({ ...prev, isOptimizing: true }));
    
    try {
      const currentMetrics = calculateMetrics();
      const thresholds = finalConfig.performanceThresholds!;
      
      // Memory optimization
      if (finalConfig.enableMemoryOptimization && 
          currentMetrics.memoryUsage > thresholds.maxMemoryUsage) {
        
        optimizeCache();
        
        // Force garbage collection if available
        if ('gc' in window && typeof window.gc === 'function') {
          window.gc();
        }
        
        console.log('🧹 Memory optimization performed');
      }
      
      // Cache optimization
      if (finalConfig.enableAggressiveCaching && 
          currentMetrics.cacheEfficiency < 80) {
        
        // Prefetch critical data using existing RPC functions
        const criticalQueries = [
          ['sidebar', 'stats'],
          ['issues', 'featured'],
          ['issues', { limit: 20 }],
        ];
        
        await Promise.allSettled(
          criticalQueries.map(queryKey =>
            queryClient.prefetchQuery({
              queryKey,
              staleTime: 10 * 60 * 1000, // 10 minutes
            })
          )
        );
        
        console.log('🚀 Cache optimization performed');
      }
      
      setOptimizationState(prev => ({
        ...prev,
        isOptimizing: false,
        lastOptimization: Date.now(),
        optimizationCount: prev.optimizationCount + 1,
      }));
      
    } catch (error) {
      console.error('Optimization error:', error);
      setOptimizationState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, [optimizationState.isOptimizing, calculateMetrics, finalConfig, optimizeCache, queryClient]);

  // Adaptive optimization scheduling
  useEffect(() => {
    const overallScore = getPerformanceScore();
    
    // Determine optimization frequency based on performance
    let intervalMs = 60000; // Default 1 minute
    
    if (overallScore < 70) {
      intervalMs = 30000; // 30 seconds for poor performance
    } else if (overallScore > 90) {
      intervalMs = 120000; // 2 minutes for excellent performance
    }
    
    // Clear existing interval
    if (optimizationIntervalRef.current) {
      clearInterval(optimizationIntervalRef.current);
    }
    
    // Set up new optimization cycle
    optimizationIntervalRef.current = setInterval(() => {
      performOptimizations();
    }, intervalMs);
    
    return () => {
      if (optimizationIntervalRef.current) {
        clearInterval(optimizationIntervalRef.current);
      }
    };
  }, [getPerformanceScore, performOptimizations]);

  // Manual optimization trigger
  const triggerOptimization = useCallback(() => {
    performOptimizations();
  }, [performOptimizations]);

  // Performance report generator
  const generatePerformanceReport = useCallback(() => {
    const metrics = calculateMetrics();
    const overallScore = getPerformanceScore();
    
    return {
      timestamp: new Date().toISOString(),
      overallScore,
      metrics,
      optimizationState,
      recommendations: [
        ...(metrics.cacheEfficiency < 80 ? ['Improve cache hit rate'] : []),
        ...(metrics.memoryUsage > 100 ? ['Reduce memory usage'] : []),
        ...(metrics.errorRate > 0.02 ? ['Address error sources'] : []),
        ...(metrics.userExperience < 80 ? ['Optimize Core Web Vitals'] : []),
      ],
    };
  }, [calculateMetrics, getPerformanceScore, optimizationState]);

  return {
    metrics: calculateMetrics(),
    overallScore: getPerformanceScore(),
    optimizationState,
    triggerOptimization,
    generatePerformanceReport,
    isOptimizing: optimizationState.isOptimizing,
  };
};
