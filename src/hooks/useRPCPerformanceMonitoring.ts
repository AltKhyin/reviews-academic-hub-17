
// ABOUTME: RPC performance monitoring and analytics for optimization tracking
import { useState, useEffect, useCallback } from 'react';
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface RPCMetrics {
  functionName: string;
  averageExecutionTime: number;
  callCount: number;
  errorRate: number;
  lastCalled: Date;
}

interface PerformanceComparison {
  rpcCallTime: number;
  legacyQueryTime: number;
  improvementPercentage: number;
  networkSavings: number;
}

export const useRPCPerformanceMonitoring = () => {
  const [rpcMetrics, setRPCMetrics] = useState<Map<string, RPCMetrics>>(new Map());
  const [performanceComparisons, setPerformanceComparisons] = useState<PerformanceComparison[]>([]);

  // Track RPC call performance
  const trackRPCCall = useCallback((functionName: string, executionTime: number, success: boolean) => {
    setRPCMetrics(prev => {
      const current = prev.get(functionName) || {
        functionName,
        averageExecutionTime: 0,
        callCount: 0,
        errorRate: 0,
        lastCalled: new Date(),
      };

      const newCallCount = current.callCount + 1;
      const newAverageTime = ((current.averageExecutionTime * current.callCount) + executionTime) / newCallCount;
      const errorCount = success ? current.errorRate * current.callCount : (current.errorRate * current.callCount) + 1;
      const newErrorRate = errorCount / newCallCount;

      const updated = new Map(prev);
      updated.set(functionName, {
        ...current,
        averageExecutionTime: newAverageTime,
        callCount: newCallCount,
        errorRate: newErrorRate,
        lastCalled: new Date(),
      });

      return updated;
    });
  }, []);

  // Monitor database query performance
  const { data: queryPerformanceData } = useOptimizedQuery(
    queryKeys.queryPerformance(),
    async () => {
      const { data, error } = await supabase.rpc('get_query_performance_stats');
      
      if (error) {
        console.error('Query performance monitoring error:', error);
        return null;
      }

      return data;
    },
    {
      ...queryConfigs.performance,
      refetchInterval: 30000, // Every 30 seconds
    }
  );

  // Compare RPC vs legacy query performance
  const comparePerformance = useCallback(async (rpcFunction: string, legacyQuery: () => Promise<any>) => {
    const rpcStart = performance.now();
    try {
      await supabase.rpc(rpcFunction);
      const rpcEnd = performance.now();
      const rpcTime = rpcEnd - rpcStart;

      const legacyStart = performance.now();
      await legacyQuery();
      const legacyEnd = performance.now();
      const legacyTime = legacyEnd - legacyStart;

      const improvement = ((legacyTime - rpcTime) / legacyTime) * 100;
      const networkSavings = legacyTime > rpcTime ? 1 : 0; // Simplified metric

      const comparison: PerformanceComparison = {
        rpcCallTime: rpcTime,
        legacyQueryTime: legacyTime,
        improvementPercentage: improvement,
        networkSavings,
      };

      setPerformanceComparisons(prev => [...prev.slice(-9), comparison]); // Keep last 10
      return comparison;
    } catch (error) {
      console.error('Performance comparison failed:', error);
      return null;
    }
  }, []);

  // Automatic performance alerts
  useEffect(() => {
    const checkPerformanceAlerts = () => {
      rpcMetrics.forEach((metrics, functionName) => {
        if (metrics.errorRate > 0.1) { // 10% error rate threshold
          console.warn(`🚨 High error rate detected for ${functionName}: ${(metrics.errorRate * 100).toFixed(1)}%`);
        }
        
        if (metrics.averageExecutionTime > 2000) { // 2 second threshold
          console.warn(`⚠️ Slow RPC function detected: ${functionName} (${metrics.averageExecutionTime.toFixed(0)}ms)`);
        }
      });
    };

    const alertInterval = setInterval(checkPerformanceAlerts, 60000); // Check every minute
    return () => clearInterval(alertInterval);
  }, [rpcMetrics]);

  // Generate performance report
  const generatePerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      rpcFunctions: Array.from(rpcMetrics.values()),
      databaseMetrics: queryPerformanceData,
      performanceComparisons,
      recommendations: [] as string[],
    };

    // Add performance recommendations
    rpcMetrics.forEach((metrics, functionName) => {
      if (metrics.averageExecutionTime > 1000) {
        report.recommendations.push(`Consider optimizing ${functionName} - average execution time: ${metrics.averageExecutionTime.toFixed(0)}ms`);
      }
      if (metrics.errorRate > 0.05) {
        report.recommendations.push(`Investigate errors in ${functionName} - error rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
      }
    });

    return report;
  }, [rpcMetrics, queryPerformanceData, performanceComparisons]);

  return {
    rpcMetrics: Array.from(rpcMetrics.values()),
    trackRPCCall,
    comparePerformance,
    generatePerformanceReport,
    queryPerformanceData,
    performanceComparisons,
  };
};
