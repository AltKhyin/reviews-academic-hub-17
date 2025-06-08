
// ABOUTME: Advanced performance utilities for memory leak detection, query optimization, and resource management
interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  heapLimit: number;
  usagePercent: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface QueryComplexityMetrics {
  complexity: number;
  estimatedTime: number;
  cacheability: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ResourceLoadingMetrics {
  totalSize: number;
  loadTime: number;
  criticalResources: string[];
  optimizationOpportunities: string[];
}

class AdvancedMemoryLeakDetector {
  private memoryHistory: MemoryMetrics[] = [];
  private listeners: Set<EventListener> = new Set();
  private timers: Set<number> = new Set();
  private observers: Set<MutationObserver | ResizeObserver | IntersectionObserver> = new Set();
  private cleanupTasks: (() => void)[] = [];
  private maxHistorySize = 50;
  private criticalThreshold = 85; // 85% memory usage

  trackEventListeners() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      this.listeners?.add(listener);
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      this.listeners?.delete(listener);
      return originalRemoveEventListener.call(this, type, listener, options);
    };
  }

  trackTimers() {
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearTimeout = window.clearTimeout;
    const originalClearInterval = window.clearInterval;
    
    window.setTimeout = (handler: TimerHandler, timeout?: number, ...args: any[]) => {
      const id = originalSetTimeout(handler, timeout, ...args);
      this.timers.add(id);
      return id;
    };
    
    window.setInterval = (handler: TimerHandler, timeout?: number, ...args: any[]) => {
      const id = originalSetInterval(handler, timeout, ...args);
      this.timers.add(id);
      return id;
    };
    
    window.clearTimeout = (id: number) => {
      this.timers.delete(id);
      return originalClearTimeout(id);
    };
    
    window.clearInterval = (id: number) => {
      this.timers.delete(id);
      return originalClearInterval(id);
    };
  }

  getMemoryMetrics(): MemoryMetrics | null {
    if (!('memory' in performance)) return null;
    
    const memory = (performance as any).memory;
    const heapUsed = memory.usedJSHeapSize;
    const heapTotal = memory.totalJSHeapSize;
    const heapLimit = memory.jsHeapSizeLimit;
    const usagePercent = (heapUsed / heapLimit) * 100;
    
    const metrics: MemoryMetrics = {
      heapUsed,
      heapTotal,
      heapLimit,
      usagePercent,
      trend: this.calculateTrend(usagePercent),
    };
    
    this.memoryHistory.push(metrics);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }
    
    return metrics;
  }

  private calculateTrend(currentUsage: number): 'increasing' | 'stable' | 'decreasing' {
    if (this.memoryHistory.length < 3) return 'stable';
    
    const recent = this.memoryHistory.slice(-3).map(m => m.usagePercent);
    const trend = recent[2] - recent[0];
    
    if (trend > 5) return 'increasing';
    if (trend < -5) return 'decreasing';
    return 'stable';
  }

  detectMemoryLeaks(): {
    hasLeaks: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  } {
    const current = this.getMemoryMetrics();
    if (!current) return { hasLeaks: false, severity: 'low', recommendations: [] };
    
    const recommendations: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let hasLeaks = false;
    
    // Check memory usage threshold
    if (current.usagePercent > this.criticalThreshold) {
      hasLeaks = true;
      severity = 'critical';
      recommendations.push('Memory usage exceeds critical threshold');
    }
    
    // Check memory trend
    if (current.trend === 'increasing' && this.memoryHistory.length >= 5) {
      const recentIncrease = this.memoryHistory.slice(-5).every((m, i, arr) => 
        i === 0 || m.usagePercent > arr[i - 1].usagePercent
      );
      
      if (recentIncrease) {
        hasLeaks = true;
        severity = severity === 'critical' ? 'critical' : 'high';
        recommendations.push('Consistent memory growth detected');
      }
    }
    
    // Check for excessive listeners
    if (this.listeners.size > 100) {
      hasLeaks = true;
      severity = severity === 'critical' ? 'critical' : 'medium';
      recommendations.push(`Too many event listeners: ${this.listeners.size}`);
    }
    
    // Check for excessive timers
    if (this.timers.size > 20) {
      hasLeaks = true;
      severity = severity === 'critical' ? 'critical' : 'medium';
      recommendations.push(`Too many active timers: ${this.timers.size}`);
    }
    
    return { hasLeaks, severity, recommendations };
  }

  forceGarbageCollection() {
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
      console.log('🗑️ Forced garbage collection executed');
    }
  }

  addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }

  cleanup() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    
    this.timers.forEach(id => {
      clearTimeout(id);
      clearInterval(id);
    });
    
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    
    this.cleanupTasks = [];
    this.timers.clear();
    this.observers.clear();
  }
}

class QueryOptimizer {
  private queryMetrics = new Map<string, QueryComplexityMetrics>();
  private batchQueue = new Map<string, any[]>();
  private batchTimeout: number | null = null;
  private readonly batchDelay = 50; // 50ms batching window

  analyzeQueryComplexity(queryKey: unknown[]): QueryComplexityMetrics {
    const keyString = JSON.stringify(queryKey);
    
    if (this.queryMetrics.has(keyString)) {
      return this.queryMetrics.get(keyString)!;
    }
    
    let complexity = 1;
    let estimatedTime = 100; // Base 100ms
    let cacheability = 10; // Base 10 minutes
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    // Analyze query patterns
    const queryString = keyString.toLowerCase();
    
    // Complex filters increase complexity
    if (queryString.includes('filter')) complexity += 2;
    if (queryString.includes('search')) complexity += 3;
    if (queryString.includes('aggregate')) complexity += 4;
    if (queryString.includes('join')) complexity += 3;
    
    // Adjust estimated time based on complexity
    estimatedTime *= complexity;
    
    // Determine priority based on query type
    if (queryString.includes('critical') || queryString.includes('auth')) {
      priority = 'critical';
      cacheability = 2; // 2 minutes for critical data
    } else if (queryString.includes('real-time') || queryString.includes('notifications')) {
      priority = 'high';
      cacheability = 1; // 1 minute for real-time data
    } else if (queryString.includes('analytics') || queryString.includes('stats')) {
      priority = 'low';
      cacheability = 30; // 30 minutes for analytics
    }
    
    const metrics: QueryComplexityMetrics = {
      complexity,
      estimatedTime,
      cacheability,
      priority,
    };
    
    this.queryMetrics.set(keyString, metrics);
    return metrics;
  }

  shouldBatchQuery(queryKey: unknown[]): boolean {
    const metrics = this.analyzeQueryComplexity(queryKey);
    return metrics.priority !== 'critical' && metrics.complexity <= 3;
  }

  addToBatch(queryKey: unknown[], queryFn: () => Promise<any>): Promise<any> {
    const keyString = JSON.stringify(queryKey);
    
    if (!this.batchQueue.has(keyString)) {
      this.batchQueue.set(keyString, []);
    }
    
    return new Promise((resolve, reject) => {
      this.batchQueue.get(keyString)!.push({ resolve, reject, queryFn });
      
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      this.batchTimeout = window.setTimeout(() => {
        this.executeBatch();
      }, this.batchDelay);
    });
  }

  private async executeBatch() {
    const batches = Array.from(this.batchQueue.entries());
    this.batchQueue.clear();
    this.batchTimeout = null;
    
    for (const [keyString, requests] of batches) {
      try {
        // Execute the first query function (they should be identical for the same key)
        const result = await requests[0].queryFn();
        
        // Resolve all requests with the same result
        requests.forEach(({ resolve }) => resolve(result));
      } catch (error) {
        // Reject all requests with the same error
        requests.forEach(({ reject }) => reject(error));
      }
    }
  }

  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze stored metrics for recommendations
    const highComplexityQueries = Array.from(this.queryMetrics.entries())
      .filter(([_, metrics]) => metrics.complexity > 5);
    
    if (highComplexityQueries.length > 0) {
      recommendations.push(`${highComplexityQueries.length} high-complexity queries detected`);
    }
    
    const criticalQueries = Array.from(this.queryMetrics.entries())
      .filter(([_, metrics]) => metrics.priority === 'critical');
    
    if (criticalQueries.length > 10) {
      recommendations.push('Too many critical priority queries');
    }
    
    return recommendations;
  }
}

class ResourceLoadingOptimizer {
  private loadingMetrics: ResourceLoadingMetrics = {
    totalSize: 0,
    loadTime: 0,
    criticalResources: [],
    optimizationOpportunities: [],
  };

  analyzeResourceLoading(): ResourceLoadingMetrics {
    if (!('getEntriesByType' in performance)) {
      return this.loadingMetrics;
    }
    
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    let totalSize = 0;
    const criticalResources: string[] = [];
    const optimizationOpportunities: string[] = [];
    
    resources.forEach(resource => {
      totalSize += resource.transferSize || 0;
      
      // Identify critical resources
      if (resource.name.includes('.js') && resource.transferSize > 500000) { // > 500KB
        criticalResources.push(`Large JS: ${resource.name} (${Math.round((resource.transferSize || 0) / 1024)}KB)`);
      }
      
      if (resource.name.includes('.css') && resource.transferSize > 100000) { // > 100KB
        criticalResources.push(`Large CSS: ${resource.name} (${Math.round((resource.transferSize || 0) / 1024)}KB)`);
      }
      
      // Identify optimization opportunities
      if (resource.duration > 1000) { // > 1 second load time
        optimizationOpportunities.push(`Slow resource: ${resource.name} (${Math.round(resource.duration)}ms)`);
      }
      
      if (!resource.name.includes('cache') && resource.duration > 100) {
        optimizationOpportunities.push(`Consider caching: ${resource.name}`);
      }
    });
    
    this.loadingMetrics = {
      totalSize,
      loadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      criticalResources,
      optimizationOpportunities,
    };
    
    return this.loadingMetrics;
  }

  preloadCriticalResources() {
    // Preload critical stylesheets
    const criticalCSS = [
      '/src/index.css',
      // Add other critical CSS files
    ];
    
    criticalCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
    
    // Preload critical JavaScript modules
    const criticalJS = [
      '/src/main.tsx',
      // Add other critical JS files
    ];
    
    criticalJS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = href;
      document.head.appendChild(link);
    });
  }
}

class PerformanceProfiler {
  private measurements = new Map<string, number[]>();
  private maxMeasurements = 100;

  startMeasurement(operation: string) {
    const markName = `${operation}-start`;
    performance.mark(markName);
  }

  endMeasurement(operation: string) {
    const startMark = `${operation}-start`;
    const endMark = `${operation}-end`;
    const measureName = operation;
    
    try {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      const measure = performance.getEntriesByName(measureName, 'measure').pop();
      if (measure) {
        this.addMeasurement(operation, measure.duration);
      }
      
      // Cleanup marks and measures
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    } catch (error) {
      console.warn(`Failed to measure ${operation}:`, error);
    }
  }

  private addMeasurement(operation: string, duration: number) {
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }
    
    const durations = this.measurements.get(operation)!;
    durations.push(duration);
    
    // Keep only recent measurements
    if (durations.length > this.maxMeasurements) {
      durations.shift();
    }
  }

  getPerformanceReport(): Record<string, { average: number; count: number; max: number; min: number }> {
    const report: Record<string, { average: number; count: number; max: number; min: number }> = {};
    
    this.measurements.forEach((durations, operation) => {
      if (durations.length > 0) {
        const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const max = Math.max(...durations);
        const min = Math.min(...durations);
        
        report[operation] = {
          average,
          count: durations.length,
          max,
          min,
        };
      }
    });
    
    return report;
  }
}

// Export singleton instances
export const MemoryLeakDetector = new AdvancedMemoryLeakDetector();
export const QueryOptimizer = new QueryOptimizer();
export const ResourceLoadingOptimizer = new ResourceLoadingOptimizer();
export const PerformanceProfiler = new PerformanceProfiler();

// Initialize memory leak detection
MemoryLeakDetector.trackEventListeners();
MemoryLeakDetector.trackTimers();

// Initialize resource loading optimization
ResourceLoadingOptimizer.preloadCriticalResources();
