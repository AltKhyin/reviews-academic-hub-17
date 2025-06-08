// ABOUTME: Performance budget monitoring and enforcement system
import { useEffect, useCallback, useRef, useState } from 'react';
import { MemoryLeakDetector, ResourceLoadingOptimizer, PerformanceProfiler } from '@/utils/performanceHelpers';

interface PerformanceBudget {
  maxBundleSize: number; // KB
  maxMemoryUsage: number; // MB
  maxQueryTime: number; // ms
  maxPageLoadTime: number; // ms
  maxLCP: number; // ms
  maxFID: number; // ms
  maxCLS: number; // score
  maxErrorRate: number; // percentage
}

interface BudgetViolation {
  metric: string;
  current: number;
  budget: number;
  severity: 'warning' | 'critical';
  recommendation: string;
}

interface BudgetStatus {
  isWithinBudget: boolean;
  score: number; // 0-100
  violations: BudgetViolation[];
  trends: Record<string, 'improving' | 'stable' | 'degrading'>;
}

const defaultBudget: PerformanceBudget = {
  maxBundleSize: 5000, // 5MB
  maxMemoryUsage: 150, // 150MB
  maxQueryTime: 2000, // 2 seconds
  maxPageLoadTime: 3000, // 3 seconds
  maxLCP: 2500, // 2.5 seconds
  maxFID: 100, // 100ms
  maxCLS: 0.1, // 0.1 score
  maxErrorRate: 5, // 5%
};

export const usePerformanceBudget = (customBudget?: Partial<PerformanceBudget>) => {
  const budget = { ...defaultBudget, ...customBudget };
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus>({
    isWithinBudget: true,
    score: 100,
    violations: [],
    trends: {},
  });

  const metricsHistory = useRef<Record<string, number[]>>({});
  const violationHistory = useRef<BudgetViolation[]>([]);
  const alertedViolations = useRef<Set<string>>(new Set());

  // Track metric trends
  const trackMetric = useCallback((metricName: string, value: number) => {
    if (!metricsHistory.current[metricName]) {
      metricsHistory.current[metricName] = [];
    }
    
    metricsHistory.current[metricName].push(value);
    
    // Keep only last 20 measurements
    if (metricsHistory.current[metricName].length > 20) {
      metricsHistory.current[metricName].shift();
    }
  }, []);

  // Calculate trend for a metric
  const calculateTrend = useCallback((metricName: string): 'improving' | 'stable' | 'degrading' => {
    const history = metricsHistory.current[metricName];
    if (!history || history.length < 5) return 'stable';
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // For metrics where lower is better (most performance metrics)
    const isLowerBetter = !['score', 'cacheHitRate'].includes(metricName);
    
    if (isLowerBetter) {
      if (change < -5) return 'improving';
      if (change > 5) return 'degrading';
    } else {
      if (change > 5) return 'improving';
      if (change < -5) return 'degrading';
    }
    
    return 'stable';
  }, []);

  // Check budget compliance
  const checkBudgetCompliance = useCallback(async (): Promise<BudgetStatus> => {
    const violations: BudgetViolation[] = [];
    const trends: Record<string, 'improving' | 'stable' | 'degrading'> = {};
    
    // Check memory usage
    const memoryMetrics = MemoryLeakDetector.getMemoryMetrics();
    if (memoryMetrics) {
      const memoryUsageMB = memoryMetrics.heapUsed / (1024 * 1024);
      trackMetric('memoryUsage', memoryUsageMB);
      trends.memoryUsage = calculateTrend('memoryUsage');
      
      if (memoryUsageMB > budget.maxMemoryUsage) {
        violations.push({
          metric: 'Memory Usage',
          current: memoryUsageMB,
          budget: budget.maxMemoryUsage,
          severity: memoryUsageMB > budget.maxMemoryUsage * 1.5 ? 'critical' : 'warning',
          recommendation: 'Reduce memory usage by clearing unused data and optimizing components',
        });
      }
    }
    
    // Check bundle size
    const resourceMetrics = ResourceLoadingOptimizer.analyzeResourceLoading();
    const bundleSizeKB = resourceMetrics.totalSize / 1024;
    trackMetric('bundleSize', bundleSizeKB);
    trends.bundleSize = calculateTrend('bundleSize');
    
    if (bundleSizeKB > budget.maxBundleSize) {
      violations.push({
        metric: 'Bundle Size',
        current: bundleSizeKB,
        budget: budget.maxBundleSize,
        severity: bundleSizeKB > budget.maxBundleSize * 1.5 ? 'critical' : 'warning',
        recommendation: 'Implement code splitting and reduce bundle size',
      });
    }
    
    // Check page load time
    if (resourceMetrics.loadTime > budget.maxPageLoadTime) {
      trackMetric('pageLoadTime', resourceMetrics.loadTime);
      trends.pageLoadTime = calculateTrend('pageLoadTime');
      
      violations.push({
        metric: 'Page Load Time',
        current: resourceMetrics.loadTime,
        budget: budget.maxPageLoadTime,
        severity: resourceMetrics.loadTime > budget.maxPageLoadTime * 1.5 ? 'critical' : 'warning',
        recommendation: 'Optimize resource loading and implement lazy loading',
      });
    }
    
    // Check Core Web Vitals (from Performance Observer if available)
    if ('PerformanceObserver' in window) {
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lcp = lcpEntries[lcpEntries.length - 1].startTime;
          trackMetric('lcp', lcp);
          trends.lcp = calculateTrend('lcp');
          
          if (lcp > budget.maxLCP) {
            violations.push({
              metric: 'Largest Contentful Paint (LCP)',
              current: lcp,
              budget: budget.maxLCP,
              severity: lcp > budget.maxLCP * 1.5 ? 'critical' : 'warning',
              recommendation: 'Optimize image loading and reduce render-blocking resources',
            });
          }
        }
      } catch (error) {
        console.warn('Failed to check LCP:', error);
      }
    }
    
    // Calculate overall score
    const maxPossibleScore = Object.keys(budget).length * 100;
    const penaltyPoints = violations.reduce((total, violation) => {
      const overagePercent = ((violation.current - violation.budget) / violation.budget) * 100;
      return total + Math.min(overagePercent, 100); // Cap at 100 points penalty per metric
    }, 0);
    
    const score = Math.max(0, 100 - (penaltyPoints / Object.keys(budget).length));
    
    const status: BudgetStatus = {
      isWithinBudget: violations.length === 0,
      score: Math.round(score),
      violations,
      trends,
    };
    
    // Track violation history
    violations.forEach(violation => {
      violationHistory.current.push(violation);
    });
    
    // Keep violation history manageable
    if (violationHistory.current.length > 100) {
      violationHistory.current = violationHistory.current.slice(-50);
    }
    
    return status;
  }, [budget, trackMetric, calculateTrend]);

  // Alert on budget violations
  const alertOnViolations = useCallback((violations: BudgetViolation[]) => {
    violations.forEach(violation => {
      const alertKey = `${violation.metric}-${violation.severity}`;
      
      if (!alertedViolations.current.has(alertKey)) {
        alertedViolations.current.add(alertKey);
        
        const alertLevel = violation.severity === 'critical' ? 'error' : 'warn';
        console[alertLevel](`🚨 Performance Budget Violation:`, {
          metric: violation.metric,
          current: violation.current,
          budget: violation.budget,
          overage: `${(((violation.current - violation.budget) / violation.budget) * 100).toFixed(1)}%`,
          recommendation: violation.recommendation,
        });
        
        // Clear alert after 5 minutes to allow re-alerting
        setTimeout(() => {
          alertedViolations.current.delete(alertKey);
        }, 5 * 60 * 1000);
      }
    });
  }, []);

  // Automatic budget monitoring
  useEffect(() => {
    const monitorBudget = async () => {
      try {
        const status = await checkBudgetCompliance();
        setBudgetStatus(status);
        
        if (status.violations.length > 0) {
          alertOnViolations(status.violations);
        }
      } catch (error) {
        console.error('Budget monitoring failed:', error);
      }
    };
    
    // Initial check
    monitorBudget();
    
    // Periodic monitoring every 30 seconds
    const interval = setInterval(monitorBudget, 30000);
    
    return () => clearInterval(interval);
  }, [checkBudgetCompliance, alertOnViolations]);

  // Manual budget check
  const checkBudget = useCallback(async () => {
    const status = await checkBudgetCompliance();
    setBudgetStatus(status);
    return status;
  }, [checkBudgetCompliance]);

  // Get performance recommendations
  const getRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    
    // Memory recommendations
    const memoryTrend = budgetStatus.trends.memoryUsage;
    if (memoryTrend === 'degrading') {
      recommendations.push('Memory usage is increasing - implement cleanup strategies');
    }
    
    // Bundle size recommendations
    const bundleTrend = budgetStatus.trends.bundleSize;
    if (bundleTrend === 'degrading') {
      recommendations.push('Bundle size is growing - consider code splitting');
    }
    
    // Add violation-specific recommendations
    budgetStatus.violations.forEach(violation => {
      if (!recommendations.includes(violation.recommendation)) {
        recommendations.push(violation.recommendation);
      }
    });
    
    return recommendations;
  }, [budgetStatus]);

  // Emergency performance cleanup
  const emergencyCleanup = useCallback(() => {
    console.warn('🚨 Executing emergency performance cleanup');
    
    // Force memory cleanup
    MemoryLeakDetector.forceGarbageCollection();
    
    // Clear performance measurement history
    metricsHistory.current = {};
    violationHistory.current = [];
    
    // Clear browser caches if possible
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.log('✅ Emergency cleanup completed');
  }, []);

  return {
    budgetStatus,
    checkBudget,
    getRecommendations,
    emergencyCleanup,
    budget,
    violationHistory: violationHistory.current,
  };
};
