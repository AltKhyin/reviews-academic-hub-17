// ABOUTME: Comprehensive performance monitoring and optimization utilities
interface PerformanceEntry {
  timestamp: number;
  duration: number;
  metadata?: any;
}

interface PerformanceReport {
  [key: string]: {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  };
}

// Performance measurement utilities
export class PerformanceProfiler {
  private static measurements = new Map<string, PerformanceEntry[]>();
  private static activeTimers = new Map<string, number>();

  static startMeasurement(operationName: string, metadata?: any): void {
    const timestamp = performance.now();
    this.activeTimers.set(operationName, timestamp);
    
    if (metadata) {
      console.log(`⏱️ Started: ${operationName}`, metadata);
    }
  }

  static endMeasurement(operationName: string): number {
    const endTime = performance.now();
    const startTime = this.activeTimers.get(operationName);
    
    if (!startTime) {
      console.warn(`No active timer found for operation: ${operationName}`);
      return 0;
    }
    
    const duration = endTime - startTime;
    this.activeTimers.delete(operationName);
    
    // Store measurement
    if (!this.measurements.has(operationName)) {
      this.measurements.set(operationName, []);
    }
    
    this.measurements.get(operationName)!.push({
      timestamp: endTime,
      duration,
    });
    
    // Keep only last 100 measurements per operation
    const measurements = this.measurements.get(operationName)!;
    if (measurements.length > 100) {
      measurements.splice(0, measurements.length - 100);
    }
    
    console.log(`✅ Completed: ${operationName} (${duration.toFixed(2)}ms)`);
    return duration;
  }

  static getPerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {};
    
    this.measurements.forEach((measurements, operationName) => {
      if (measurements.length === 0) return;
      
      const durations = measurements.map(m => m.duration);
      const total = durations.reduce((sum, d) => sum + d, 0);
      
      report[operationName] = {
        count: measurements.length,
        total,
        average: total / measurements.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
      };
    });
    
    return report;
  }

  static clearMeasurements(): void {
    this.measurements.clear();
    this.activeTimers.clear();
  }
}

// Memory leak detection utilities
export class MemoryLeakDetector {
  private static eventListenerCount = 0;
  private static timerCount = 0;
  private static intervalIds = new Set<number>();
  private static timeoutIds = new Set<number>();

  static trackEventListeners(): void {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    EventTarget.prototype.addEventListener = function(...args) {
      MemoryLeakDetector.eventListenerCount++;
      return originalAddEventListener.apply(this, args);
    };
    
    EventTarget.prototype.removeEventListener = function(...args) {
      MemoryLeakDetector.eventListenerCount = Math.max(0, MemoryLeakDetector.eventListenerCount - 1);
      return originalRemoveEventListener.apply(this, args);
    };
  }

  static trackTimers(): void {
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearTimeout = window.clearTimeout;
    const originalClearInterval = window.clearInterval;
    
    window.setTimeout = ((callback: any, delay: any, ...args: any[]) => {
      const id = originalSetTimeout(callback, delay, ...args);
      this.timeoutIds.add(id);
      this.timerCount++;
      return id;
    }) as typeof setTimeout;
    
    window.setInterval = ((callback: any, delay: any, ...args: any[]) => {
      const id = originalSetInterval(callback, delay, ...args);
      this.intervalIds.add(id);
      this.timerCount++;
      return id;
    }) as typeof setInterval;
    
    window.clearTimeout = (id: number) => {
      this.timeoutIds.delete(id);
      this.timerCount = Math.max(0, this.timerCount - 1);
      return originalClearTimeout(id);
    };
    
    window.clearInterval = (id: number) => {
      this.intervalIds.delete(id);
      this.timerCount = Math.max(0, this.timerCount - 1);
      return originalClearInterval(id);
    };
  }

  static getLeakReport() {
    return {
      eventListeners: this.eventListenerCount,
      timers: this.timerCount,
      activeIntervals: this.intervalIds.size,
      activeTimeouts: this.timeoutIds.size,
      memoryUsage: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      } : null,
    };
  }

  static cleanup(): void {
    // Clear all tracked intervals and timeouts
    this.intervalIds.forEach(id => clearInterval(id));
    this.timeoutIds.forEach(id => clearTimeout(id));
    
    this.intervalIds.clear();
    this.timeoutIds.clear();
    this.eventListenerCount = 0;
    this.timerCount = 0;
  }
}

// Query performance analysis
export class QueryPerformanceAnalyzer {
  private static queryMetrics = new Map<string, {
    executionTimes: number[];
    cacheHits: number;
    cacheMisses: number;
    errorCount: number;
  }>();

  static recordQueryExecution(queryKey: string, executionTime: number, fromCache: boolean, error?: Error): void {
    if (!this.queryMetrics.has(queryKey)) {
      this.queryMetrics.set(queryKey, {
        executionTimes: [],
        cacheHits: 0,
        cacheMisses: 0,
        errorCount: 0,
      });
    }
    
    const metrics = this.queryMetrics.get(queryKey)!;
    
    if (!fromCache) {
      metrics.executionTimes.push(executionTime);
      // Keep only last 50 execution times
      if (metrics.executionTimes.length > 50) {
        metrics.executionTimes.splice(0, 1);
      }
    }
    
    if (fromCache) {
      metrics.cacheHits++;
    } else {
      metrics.cacheMisses++;
    }
    
    if (error) {
      metrics.errorCount++;
    }
  }

  static getQueryReport() {
    const report: { [key: string]: any } = {};
    
    this.queryMetrics.forEach((metrics, queryKey) => {
      const executionTimes = metrics.executionTimes;
      const totalRequests = metrics.cacheHits + metrics.cacheMisses;
      
      report[queryKey] = {
        totalRequests,
        cacheHitRate: totalRequests > 0 ? (metrics.cacheHits / totalRequests) * 100 : 0,
        averageExecutionTime: executionTimes.length > 0 
          ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
          : 0,
        errorRate: totalRequests > 0 ? (metrics.errorCount / totalRequests) * 100 : 0,
        slowQueries: executionTimes.filter(time => time > 1000).length,
      };
    });
    
    return report;
  }

  static clearMetrics(): void {
    this.queryMetrics.clear();
  }
}

// Component render performance tracking
export class ComponentPerformanceTracker {
  private static renderCounts = new Map<string, number>();
  private static renderTimes = new Map<string, number[]>();

  static trackComponentRender(componentName: string, renderTime: number): void {
    // Update render count
    const currentCount = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, currentCount + 1);
    
    // Update render times
    if (!this.renderTimes.has(componentName)) {
      this.renderTimes.set(componentName, []);
    }
    
    const times = this.renderTimes.get(componentName)!;
    times.push(renderTime);
    
    // Keep only last 100 render times
    if (times.length > 100) {
      times.splice(0, 1);
    }
    
    // Log slow renders
    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  static getComponentReport() {
    const report: { [key: string]: any } = {};
    
    this.renderTimes.forEach((times, componentName) => {
      const renderCount = this.renderCounts.get(componentName) || 0;
      const averageTime = times.length > 0 
        ? times.reduce((sum, time) => sum + time, 0) / times.length 
        : 0;
      
      report[componentName] = {
        renderCount,
        averageRenderTime: averageTime,
        slowRenders: times.filter(time => time > 16).length,
        maxRenderTime: times.length > 0 ? Math.max(...times) : 0,
      };
    });
    
    return report;
  }

  static clearMetrics(): void {
    this.renderCounts.clear();
    this.renderTimes.clear();
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  
  return function(this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = undefined;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait) as any;
    
    if (callNow) func.apply(this, args);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization with TTL for expensive calculations
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  func: T,
  ttl: number = 60000 // 1 minute default
): T {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);
    
    if (cached && now < cached.expiry) {
      return cached.value;
    }
    
    const result = func(...args);
    cache.set(key, { value: result, expiry: now + ttl });
    
    // Cleanup expired entries periodically
    if (cache.size > 50) {
      for (const [k, v] of cache.entries()) {
        if (now >= v.expiry) {
          cache.delete(k);
        }
      }
    }
    
    return result;
  }) as T;
}

// Bundle size analyzer
export const BundleAnalyzer = {
  analyzeComponent: (componentName: string, component: any) => {
    const serialized = JSON.stringify(component);
    const sizeKB = new Blob([serialized]).size / 1024;
    
    if (sizeKB > 100) {
      console.warn(`📦 Large component detected: ${componentName} (~${sizeKB.toFixed(1)}KB)`);
    }
    
    return { componentName, sizeKB };
  },
  
  trackImport: (moduleName: string, moduleSize?: number) => {
    if (moduleSize && moduleSize > 500) { // 500KB threshold
      console.warn(`📦 Large module imported: ${moduleName} (~${(moduleSize / 1024).toFixed(1)}MB)`);
    }
  },
};

// Performance budget checker
export const PerformanceBudget = {
  budgets: {
    bundleSize: 2 * 1024 * 1024, // 2MB
    initialLoadTime: 3000, // 3 seconds
    cacheHitRate: 80, // 80%
    memoryUsage: 150 * 1024 * 1024, // 150MB
  },
  
  checkBudgets: (metrics: any) => {
    const violations = [];
    
    if (metrics.bundleSize > PerformanceBudget.budgets.bundleSize) {
      violations.push(`Bundle size exceeds budget: ${(metrics.bundleSize / 1024 / 1024).toFixed(1)}MB > ${(PerformanceBudget.budgets.bundleSize / 1024 / 1024).toFixed(1)}MB`);
    }
    
    if (metrics.loadTime > PerformanceBudget.budgets.initialLoadTime) {
      violations.push(`Load time exceeds budget: ${metrics.loadTime}ms > ${PerformanceBudget.budgets.initialLoadTime}ms`);
    }
    
    if (metrics.cacheHitRate < PerformanceBudget.budgets.cacheHitRate) {
      violations.push(`Cache hit rate below budget: ${metrics.cacheHitRate}% < ${PerformanceBudget.budgets.cacheHitRate}%`);
    }
    
    if (violations.length > 0) {
      console.warn('🚨 Performance Budget Violations:');
      violations.forEach(violation => console.warn(`  • ${violation}`));
    }
    
    return violations;
  },
};
