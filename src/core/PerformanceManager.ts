// ABOUTME: Unified performance management system replacing overlapping performance hooks
import { GlobalRequestManager } from './GlobalRequestManager';
import { DataAccessLayer } from './DataAccessLayer';

export interface PerformanceMetrics {
  requestMetrics: {
    totalRequests: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
  };
  componentMetrics: {
    renderCount: number;
    averageRenderTime: number;
    rerenderCount: number;
  };
  memoryMetrics: {
    usedMemory: number;
    memoryTrend: 'stable' | 'increasing' | 'decreasing';
  };
  userExperienceMetrics: {
    pageLoadTime: number;
    timeToInteractive: number;
    cumulativeLayoutShift: number;
  };
}

export interface OptimizationRule {
  condition: (metrics: PerformanceMetrics) => boolean;
  action: (context: OptimizationContext) => Promise<void>;
  priority: number;
}

export interface OptimizationContext {
  requestManager: GlobalRequestManager;
  dataLayer: DataAccessLayer;
  metrics: PerformanceMetrics;
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private requestManager: GlobalRequestManager;
  private dataLayer: DataAccessLayer;
  private componentMetrics: Map<string, { renders: number; totalTime: number }> = new Map();
  private memoryBaseline: number = 0;
  private memoryHistory: number[] = [];
  private optimizationRules: OptimizationRule[] = [];

  private constructor() {
    this.requestManager = GlobalRequestManager.getInstance();
    this.dataLayer = DataAccessLayer.getInstance();
    this.setupOptimizationRules();
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  startMonitoring(): void {
    // Initialize performance monitoring
    this.memoryBaseline = this.getCurrentMemoryUsage();
    
    // Set up periodic monitoring
    setInterval(() => {
      this.collectMemoryMetrics();
      this.runOptimizationEngine();
    }, 30000); // Every 30 seconds
    
    // Monitor performance observer
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObserver();
    }
  }

  collectMetrics(): PerformanceMetrics {
    return {
      requestMetrics: this.collectRequestMetrics(),
      componentMetrics: this.collectComponentMetrics(),
      memoryMetrics: this.collectMemoryMetrics(),
      userExperienceMetrics: this.collectUXMetrics(),
    };
  }

  trackComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName) || { renders: 0, totalTime: 0 };
    existing.renders++;
    existing.totalTime += renderTime;
    this.componentMetrics.set(componentName, existing);
  }

  private collectRequestMetrics() {
    const requestManagerMetrics = this.requestManager.getRequestMetrics();
    return {
      totalRequests: requestManagerMetrics.totalRequests,
      requestsPerSecond: requestManagerMetrics.requestsPerSecond,
      averageResponseTime: requestManagerMetrics.averageResponseTime,
      errorRate: requestManagerMetrics.errorRate,
    };
  }

  private collectComponentMetrics() {
    const totalRenders = Array.from(this.componentMetrics.values())
      .reduce((sum, metric) => sum + metric.renders, 0);
    
    const totalTime = Array.from(this.componentMetrics.values())
      .reduce((sum, metric) => sum + metric.totalTime, 0);
    
    return {
      renderCount: totalRenders,
      averageRenderTime: totalRenders > 0 ? totalTime / totalRenders : 0,
      rerenderCount: totalRenders, // Simplified for now
    };
  }

  private collectMemoryMetrics() {
    const currentMemory = this.getCurrentMemoryUsage();
    this.memoryHistory.push(currentMemory);
    
    // Keep only last 10 measurements
    if (this.memoryHistory.length > 10) {
      this.memoryHistory = this.memoryHistory.slice(-10);
    }
    
    const trend = this.calculateMemoryTrend();
    
    return {
      usedMemory: currentMemory,
      memoryTrend: trend,
    };
  }

  private collectUXMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
      timeToInteractive: this.estimateTimeToInteractive(),
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
    };
  }

  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  private calculateMemoryTrend(): 'stable' | 'increasing' | 'decreasing' {
    if (this.memoryHistory.length < 3) return 'stable';
    
    const recent = this.memoryHistory.slice(-3);
    const isIncreasing = recent.every((val, i) => i === 0 || val > recent[i - 1]);
    const isDecreasing = recent.every((val, i) => i === 0 || val < recent[i - 1]);
    
    if (isIncreasing) return 'increasing';
    if (isDecreasing) return 'decreasing';
    return 'stable';
  }

  private estimateTimeToInteractive(): number {
    // Simplified TTI estimation
    const firstContentfulPaint = this.getFirstContentfulPaint();
    return firstContentfulPaint + 1000; // Rough estimate
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  private getCumulativeLayoutShift(): number {
    // This would typically come from Layout Instability API
    return 0; // Placeholder
  }

  private setupPerformanceObserver(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          // Track custom measurements
          console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
  }

  private setupOptimizationRules(): void {
    this.optimizationRules = [
      {
        condition: (metrics) => metrics.requestMetrics.totalRequests > 50,
        action: async (context) => {
          console.warn('High request count detected, consider request batching');
          // Could implement automatic request batching here
        },
        priority: 1,
      },
      {
        condition: (metrics) => metrics.memoryMetrics.memoryTrend === 'increasing',
        action: async (context) => {
          console.warn('Memory usage increasing, clearing caches');
          await context.dataLayer.invalidateCache();
        },
        priority: 2,
      },
      {
        condition: (metrics) => metrics.requestMetrics.errorRate > 0.1,
        action: async (context) => {
          console.error('High error rate detected in requests');
          // Could implement circuit breaker pattern here
        },
        priority: 1,
      },
    ];
  }

  private async runOptimizationEngine(): Promise<void> {
    const metrics = this.collectMetrics();
    const context: OptimizationContext = {
      requestManager: this.requestManager,
      dataLayer: this.dataLayer,
      metrics,
    };

    // Sort rules by priority and execute applicable ones
    const applicableRules = this.optimizationRules
      .filter(rule => rule.condition(metrics))
      .sort((a, b) => a.priority - b.priority);

    for (const rule of applicableRules) {
      try {
        await rule.action(context);
      } catch (error) {
        console.error('Optimization rule failed:', error);
      }
    }
  }

  getPerformanceReport(): PerformanceMetrics {
    return this.collectMetrics();
  }

  clearMetrics(): void {
    this.componentMetrics.clear();
    this.memoryHistory = [];
    this.requestManager.clearMetrics();
  }
}
