
// ABOUTME: RPC performance monitoring for database function optimization
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RPCMetric {
  functionName: string;
  callCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  errorCount: number;
  lastCalled: Date;
}

interface PerformanceComparison {
  functionName: string;
  rpcTime: number;
  legacyTime: number;
  improvementPercentage: number;
  timestamp: Date;
}

export const useRPCPerformanceMonitoring = () => {
  const [rpcMetrics, setRpcMetrics] = useState<RPCMetric[]>([]);
  const [performanceComparisons, setPerformanceComparisons] = useState<PerformanceComparison[]>([]);
  const [queryPerformanceData, setQueryPerformanceData] = useState<any>(null);

  // Record RPC call performance
  const recordRPCCall = useCallback((functionName: string, executionTime: number, hasError = false) => {
    setRpcMetrics(prev => {
      const existing = prev.find(m => m.functionName === functionName);
      
      if (existing) {
        return prev.map(m => 
          m === existing 
            ? {
                ...m,
                callCount: m.callCount + 1,
                totalExecutionTime: m.totalExecutionTime + executionTime,
                averageExecutionTime: (m.totalExecutionTime + executionTime) / (m.callCount + 1),
                errorCount: m.errorCount + (hasError ? 1 : 0),
                lastCalled: new Date(),
              }
            : m
        );
      } else {
        return [...prev, {
          functionName,
          callCount: 1,
          totalExecutionTime: executionTime,
          averageExecutionTime: executionTime,
          errorCount: hasError ? 1 : 0,
          lastCalled: new Date(),
        }];
      }
    });
  }, []);

  // Compare RPC vs legacy performance
  const comparePerformance = useCallback((functionName: string, rpcTime: number, legacyTime: number) => {
    const improvement = ((legacyTime - rpcTime) / legacyTime) * 100;
    
    setPerformanceComparisons(prev => {
      const comparison: PerformanceComparison = {
        functionName,
        rpcTime,
        legacyTime,
        improvementPercentage: improvement,
        timestamp: new Date(),
      };
      
      return [...prev.slice(-9), comparison]; // Keep last 10 comparisons
    });
  }, []);

  // Fetch query performance stats
  const fetchQueryPerformanceStats = useCallback(async () => {
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.rpc('get_query_performance_stats');
      const endTime = performance.now();
      
      if (!error && data) {
        setQueryPerformanceData(data);
        recordRPCCall('get_query_performance_stats', endTime - startTime, false);
      } else {
        recordRPCCall('get_query_performance_stats', endTime - startTime, true);
      }
    } catch (error) {
      console.warn('Failed to fetch query performance stats:', error);
    }
  }, [recordRPCCall]);

  // Generate performance report
  const generatePerformanceReport = useCallback(() => {
    const totalCalls = rpcMetrics.reduce((sum, m) => sum + m.callCount, 0);
    const totalErrors = rpcMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const avgExecutionTime = rpcMetrics.length > 0 
      ? rpcMetrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) / rpcMetrics.length 
      : 0;

    const slowFunctions = rpcMetrics.filter(m => m.averageExecutionTime > 1000);
    const errorProneFunctions = rpcMetrics.filter(m => m.errorCount / m.callCount > 0.1);

    const recommendations = [];
    if (slowFunctions.length > 0) {
      recommendations.push(`Optimize slow RPC functions: ${slowFunctions.map(f => f.functionName).join(', ')}`);
    }
    if (errorProneFunctions.length > 0) {
      recommendations.push(`Review error-prone functions: ${errorProneFunctions.map(f => f.functionName).join(', ')}`);
    }
    if (avgExecutionTime > 500) {
      recommendations.push('Consider database indexing for better RPC performance');
    }

    return {
      summary: {
        totalCalls,
        totalErrors,
        errorRate: totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0,
        avgExecutionTime,
      },
      slowFunctions,
      errorProneFunctions,
      recommendations,
      performanceComparisons: performanceComparisons.slice(-5),
    };
  }, [rpcMetrics, performanceComparisons]);

  // Fetch performance data periodically
  useEffect(() => {
    fetchQueryPerformanceStats();
    
    const interval = setInterval(fetchQueryPerformanceStats, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchQueryPerformanceStats]);

  return {
    rpcMetrics,
    performanceComparisons,
    queryPerformanceData,
    recordRPCCall,
    comparePerformance,
    generatePerformanceReport,
  };
};
