// ABOUTME: Advanced performance optimizer that coordinates all performance systems with intelligent decision making
import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import { useErrorTracking } from './useErrorTracking';
import { useOptimizedQueryClient } from './useOptimizedQueryClient';
import { usePerformanceBudget } from './usePerformanceBudget';
import { useIntelligentCache } from './useIntelligentCache';
import { MemoryLeakDetector, QueryOptimizerInstance, ResourceLoadingOptimizerInstance, PerformanceProfilerInstance } from '@/utils/performanceHelpers';

interface AdvancedPerformanceMetrics {
  // Existing metrics
  cacheEfficiency: number;
  queryPerformance: number;
  errorRate: number;
  memoryUsage: number;
  networkLatency: number;
  userExperience: number;
  
  // New advanced metrics
  memoryLeakRisk: number;
  queryComplexityScore: number;
  resourceOptimizationScore: number;
  budgetCompliance: number;
  cacheIntelligence: number;
  overallOptimizationHealth: number;
}

interface OptimizationAction {
  type: 'memory' | 'query' | 'cache' | 'resource' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: () => Promise<void>;
  estimatedImpact: number; // 1-100
}

interface OptimizationState {
  isOptimizing: boolean;
  lastOptimization: number;
  optimizationCount: number;
  activeOptimizations: string[];
  optimizationHistory: OptimizationAction[];
  scheduledOptimizations: OptimizationAction[];
}

export const useAdvancedPerformanceOptimizer = () => {
  const queryClient = useQueryClient();
  const { metrics: performanceMetrics, getPerformanceScore } = usePerformanceMonitoring();
  const { errorMetrics } = useErrorTracking();
  const { cacheMetrics, optimizeCache } = useOptimizedQueryClient();
  const { budgetStatus, checkBudget, emergencyCleanup } = usePerformanceBudget();
  const { getCacheStats, invalidateRelated, warmCache, predictiveInvalidation } = useIntelligentCache();
  
  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    isOptimizing: false,
    lastOptimization: Date.now(),
    optimizationCount: 0,
    activeOptimizations: [],
    optimizationHistory: [],
    scheduledOptimizations: [],
  });

  const optimizationQueue = useRef<OptimizationAction[]>([]);
  const isProcessingQueue = useRef(false);
  const performanceThresholds = useRef({
    criticalMemoryUsage: 200, // MB
    criticalErrorRate: 0.1, // 10%
    criticalQueryTime: 5000, // 5 seconds
    criticalBudgetScore: 30, // Below 30/100
  });

  // Calculate advanced performance metrics
  const calculateAdvancedMetrics = useCallback((): AdvancedPerformanceMetrics => {
    // Existing metrics calculation
    const cacheEfficiency = cacheMetrics.hitRate || 0;
    const queryPerformance = Math.max(0, 100 - (performanceMetrics.queryPerformance.averageQueryTime / 10));
    const errorRate = errorMetrics.errorRate || 0;
    const memoryUsage = performanceMetrics.memoryUsage || 0;
    const networkLatency = performanceMetrics.networkLatency || 0;
    
    let userExperience = 100;
    if (performanceMetrics.lcp && performanceMetrics.lcp > 2500) userExperience -= 20;
    if (performanceMetrics.fid && performanceMetrics.fid > 100) userExperience -= 15;
    if (performanceMetrics.cls && performanceMetrics.cls > 0.1) userExperience -= 15;

    // New advanced metrics
    const memoryLeakDetection = MemoryLeakDetector.detectMemoryLeaks();
    const memoryLeakRisk = memoryLeakDetection.hasLeaks 
      ? memoryLeakDetection.severity === 'critical' ? 100 
      : memoryLeakDetection.severity === 'high' ? 75
      : memoryLeakDetection.severity === 'medium' ? 50 : 25
      : 0;

    const queryOptimizationRecommendations = QueryOptimizerInstance.getOptimizationRecommendations();
    const queryComplexityScore = Math.max(0, 100 - (queryOptimizationRecommendations.length * 10));

    const resourceMetrics = ResourceLoadingOptimizerInstance.analyzeResourceLoading();
    const resourceOptimizationScore = Math.max(0, 100 - resourceMetrics.optimizationOpportunities.length * 5);

    const budgetCompliance = budgetStatus.score;

    const cacheStats = getCacheStats();
    const cacheIntelligence = Math.min(100, (cacheStats.cacheHitRate + (cacheStats.dependentQueries / cacheStats.totalQueries) * 100) / 2);

    const overallOptimizationHealth = [
      cacheEfficiency,
      queryPerformance,
      100 - errorRate * 10,
      Math.max(0, 100 - memoryUsage / 2),
      Math.max(0, 100 - networkLatency / 20),
      userExperience,
      100 - memoryLeakRisk,
      queryComplexityScore,
      resourceOptimizationScore,
      budgetCompliance,
      cacheIntelligence,
    ].reduce((sum, score) => sum + score, 0) / 11;

    return {
      cacheEfficiency,
      queryPerformance,
      errorRate,
      memoryUsage,
      networkLatency,
      userExperience,
      memoryLeakRisk,
      queryComplexityScore,
      resourceOptimizationScore,
      budgetCompliance,
      cacheIntelligence,
      overallOptimizationHealth,
    };
  }, [
    cacheMetrics,
    performanceMetrics,
    errorMetrics,
    budgetStatus,
    getCacheStats,
  ]);

  // Generate optimization actions based on current state
  const generateOptimizationActions = useCallback(async (): Promise<OptimizationAction[]> => {
    const metrics = calculateAdvancedMetrics();
    const actions: OptimizationAction[] = [];

    // Memory optimization actions
    if (metrics.memoryLeakRisk > 50) {
      actions.push({
        type: 'memory',
        priority: metrics.memoryLeakRisk > 75 ? 'critical' : 'high',
        description: 'Execute memory leak cleanup and garbage collection',
        action: async () => {
          MemoryLeakDetector.forceGarbageCollection();
          MemoryLeakDetector.cleanup();
        },
        estimatedImpact: 30,
      });
    }

    if (metrics.memoryUsage > performanceThresholds.current.criticalMemoryUsage) {
      actions.push({
        type: 'memory',
        priority: 'critical',
        description: 'Emergency memory cleanup',
        action: async () => {
          emergencyCleanup();
        },
        estimatedImpact: 40,
      });
    }

    // Query optimization actions
    if (metrics.queryComplexityScore < 70) {
      actions.push({
        type: 'query',
        priority: 'medium',
        description: 'Optimize complex queries and implement batching',
        action: async () => {
          // Query optimization would be implemented here
          console.log('🔧 Optimizing complex queries');
        },
        estimatedImpact: 25,
      });
    }

    // Cache optimization actions
    if (metrics.cacheEfficiency < 80) {
      actions.push({
        type: 'cache',
        priority: 'medium',
        description: 'Optimize cache strategy and warm critical data',
        action: async () => {
          await optimizeCache();
          await warmCache('high');
        },
        estimatedImpact: 35,
      });
    }

    if (metrics.cacheIntelligence < 60) {
      actions.push({
        type: 'cache',
        priority: 'low',
        description: 'Perform predictive cache invalidation',
        action: async () => {
          predictiveInvalidation();
          invalidateRelated('optimization-cycle');
        },
        estimatedImpact: 20,
      });
    }

    // Resource optimization actions
    if (metrics.resourceOptimizationScore < 70) {
      actions.push({
        type: 'resource',
        priority: 'medium',
        description: 'Optimize resource loading and implement preloading',
        action: async () => {
          ResourceLoadingOptimizerInstance.preloadCriticalResources();
        },
        estimatedImpact: 30,
      });
    }

    // Budget compliance actions
    if (metrics.budgetCompliance < performanceThresholds.current.criticalBudgetScore) {
      actions.push({
        type: 'emergency',
        priority: 'critical',
        description: 'Emergency performance budget enforcement',
        action: async () => {
          await checkBudget();
          emergencyCleanup();
        },
        estimatedImpact: 50,
      });
    }

    // Sort actions by priority and estimated impact
    return actions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.estimatedImpact - a.estimatedImpact;
    });
  }, [
    calculateAdvancedMetrics,
    emergencyCleanup,
    optimizeCache,
    warmCache,
    predictiveInvalidation,
    invalidateRelated,
    checkBudget,
  ]);

  // Process optimization queue
  const processOptimizationQueue = useCallback(async () => {
    if (isProcessingQueue.current || optimizationQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    setOptimizationState(prev => ({ ...prev, isOptimizing: true }));

    const action = optimizationQueue.current.shift()!;
    
    try {
      setOptimizationState(prev => ({
        ...prev,
        activeOptimizations: [...prev.activeOptimizations, action.description],
      }));

      PerformanceProfilerInstance.startMeasurement(`optimization-${action.type}`);
      await action.action();
      PerformanceProfilerInstance.endMeasurement(`optimization-${action.type}`);

      setOptimizationState(prev => ({
        ...prev,
        optimizationCount: prev.optimizationCount + 1,
        lastOptimization: Date.now(),
        optimizationHistory: [...prev.optimizationHistory, action].slice(-20), // Keep last 20
        activeOptimizations: prev.activeOptimizations.filter(desc => desc !== action.description),
      }));

      console.log(`✅ Optimization completed: ${action.description}`);
    } catch (error) {
      console.error(`❌ Optimization failed: ${action.description}`, error);
    }

    isProcessingQueue.current = false;
    setOptimizationState(prev => ({ ...prev, isOptimizing: false }));

    // Process next action if queue is not empty
    if (optimizationQueue.current.length > 0) {
      setTimeout(processOptimizationQueue, 100); // Small delay between optimizations
    }
  }, []);

  // Schedule optimization actions
  const scheduleOptimizations = useCallback(async () => {
    const actions = await generateOptimizationActions();
    
    // Add critical and high priority actions to immediate queue
    const immediateActions = actions.filter(action => 
      action.priority === 'critical' || action.priority === 'high'
    );
    
    optimizationQueue.current.push(...immediateActions);

    // Schedule medium and low priority actions
    const scheduledActions = actions.filter(action => 
      action.priority === 'medium' || action.priority === 'low'
    );

    setOptimizationState(prev => ({
      ...prev,
      scheduledOptimizations: scheduledActions,
    }));

    if (optimizationQueue.current.length > 0) {
      processOptimizationQueue();
    }
  }, [generateOptimizationActions, processOptimizationQueue]);

  // Manual optimization trigger
  const triggerOptimization = useCallback(async () => {
    await scheduleOptimizations();
  }, [scheduleOptimizations]);

  // Automatic optimization scheduling based on performance state
  useEffect(() => {
    const metrics = calculateAdvancedMetrics();
    
    // Determine optimization frequency based on performance health
    let intervalMs = 60000; // Default 1 minute
    
    if (metrics.overallOptimizationHealth < 50) {
      intervalMs = 30000; // 30 seconds for poor performance
    } else if (metrics.overallOptimizationHealth > 90) {
      intervalMs = 120000; // 2 minutes for excellent performance
    }

    const optimizationInterval = setInterval(scheduleOptimizations, intervalMs);
    
    return () => clearInterval(optimizationInterval);
  }, [calculateAdvancedMetrics, scheduleOptimizations]);

  // Process scheduled optimizations periodically
  useEffect(() => {
    const processScheduled = () => {
      if (optimizationState.scheduledOptimizations.length > 0) {
        // Move one scheduled optimization to queue
        const nextAction = optimizationState.scheduledOptimizations[0];
        optimizationQueue.current.push(nextAction);
        
        setOptimizationState(prev => ({
          ...prev,
          scheduledOptimizations: prev.scheduledOptimizations.slice(1),
        }));

        processOptimizationQueue();
      }
    };

    const scheduledInterval = setInterval(processScheduled, 10000); // Every 10 seconds
    
    return () => clearInterval(scheduledInterval);
  }, [optimizationState.scheduledOptimizations, processOptimizationQueue]);

  // Generate comprehensive performance report
  const generatePerformanceReport = useCallback(() => {
    const metrics = calculateAdvancedMetrics();
    const performanceReport = PerformanceProfilerInstance.getPerformanceReport();
    
    return {
      timestamp: new Date().toISOString(),
      overallScore: metrics.overallOptimizationHealth,
      metrics,
      optimizationState,
      performanceReport,
      recommendations: [
        ...(metrics.memoryLeakRisk > 30 ? ['Address memory leak risks'] : []),
        ...(metrics.queryComplexityScore < 70 ? ['Optimize complex queries'] : []),
        ...(metrics.cacheEfficiency < 80 ? ['Improve cache hit rate'] : []),
        ...(metrics.resourceOptimizationScore < 70 ? ['Optimize resource loading'] : []),
        ...(metrics.budgetCompliance < 70 ? ['Address performance budget violations'] : []),
        ...(metrics.cacheIntelligence < 60 ? ['Enhance cache intelligence'] : []),
      ],
    };
  }, [calculateAdvancedMetrics, optimizationState]);

  return {
    metrics: calculateAdvancedMetrics(),
    overallScore: calculateAdvancedMetrics().overallOptimizationHealth,
    optimizationState,
    triggerOptimization,
    generatePerformanceReport,
    isOptimizing: optimizationState.isOptimizing,
    optimizationHistory: optimizationState.optimizationHistory,
    scheduledOptimizations: optimizationState.scheduledOptimizations,
  };
};
