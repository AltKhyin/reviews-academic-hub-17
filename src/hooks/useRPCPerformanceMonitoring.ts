
// ABOUTME: RPC function performance monitoring and optimization tracking
import { useState, useEffect, useCallback } from 'react';
import { useOptimizedQuery, queryKeys } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface RPCMetric {
  functionName: string;
  callCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  lastExecuted: Date;
}

interface PerformanceComparison {
  rpcTime: number;
  legacyTime: number;
  improvementPercentage: number;
  timestamp: Date;
}

export const useRPCPerformanceMonitoring = () => {
  const [rpcMetrics, setRpcMetrics] = useState<RPCMetric[]>([]);
  const [performanceComparisons, setPerformanceComparisons] = useState<PerformanceComparison[]>([]);

  // Query performance data using the existing RPC function
  const { data: queryPerformanceData } = useOptimizedQuery(
    queryKeys.queryPerformance(),
    async () => {
      const { data, error } = await supabase.rpc('get_query_performance_stats');
      if (error) throw error;
      return data;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 60000, // 1 minute
    }
  );

  const trackRPCCall = useCallback((functionName: string, executionTime: number) => {
    setRpcMetrics(prev => {
      const existing = prev.find(m => m.functionName === functionName);
      if (existing) {
        const newCallCount = existing.callCount + 1;
        const newTotalTime = existing.totalExecutionTime + executionTime;
        return prev.map(m => 
          m.functionName === functionName
            ? {
                ...m,
                callCount: newCallCount,
                totalExecutionTime: newTotalTime,
                averageExecutionTime: newTotalTime / newCallCount,
                lastExecuted: new Date(),
              }
            : m
        );
      } else {
        return [...prev, {
          functionName,
          callCount: 1,
          totalExecutionTime: executionTime,
          averageExecutionTime: executionTime,
          lastExecuted: new Date(),
        }];
      }
    });
  }, []);

  const generatePerformanceReport = useCallback(() => {
    const slowFunctions = rpcMetrics.filter(m => m.averageExecutionTime > 1000);
    const recommendations = [
      ...slowFunctions.map(f => `Optimize ${f.functionName} (${f.averageExecutionTime.toFixed(0)}ms avg)`),
    ];

    return {
      timestamp: new Date(),
      totalRPCCalls: rpcMetrics.reduce((sum, m) => sum + m.callCount, 0),
      averageResponseTime: rpcMetrics.length > 0 
        ? rpcMetrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) / rpcMetrics.length 
        : 0,
      slowFunctions,
      recommendations,
    };
  }, [rpcMetrics]);

  return {
    rpcMetrics,
    queryPerformanceData,
    performanceComparisons,
    trackRPCCall,
    generatePerformanceReport,
  };
};
