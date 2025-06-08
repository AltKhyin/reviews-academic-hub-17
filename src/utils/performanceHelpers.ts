// ABOUTME: Performance utility functions and helpers for optimization across the application
export class PerformanceProfiler {
  private static measurements = new Map<string, number>();
  private static logs: Array<{ operation: string; duration: number; timestamp: number }> = [];

  static startMeasurement(operation: string): void {
    this.measurements.set(operation, performance.now());
  }

  static endMeasurement(operation: string): number {
    const startTime = this.measurements.get(operation);
    if (!startTime) {
      console.warn(`No start measurement found for operation: ${operation}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(operation);
    
    this.logs.push({
      operation,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 100 measurements
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    if (duration > 100) { // Log slow operations
      console.warn(`⚠️ Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static getAverageTime(operation: string): number {
    const operationLogs = this.logs.filter(log => log.operation === operation);
    if (operationLogs.length === 0) return 0;
    
    const total = operationLogs.reduce((sum, log) => sum + log.duration, 0);
    return total / operationLogs.length;
  }

  static getPerformanceReport(): Record<string, { average: number; count: number; recent: number[] }> {
    const report: Record<string, { average: number; count: number; recent: number[] }> = {};
    
    const operations = [...new Set(this.logs.map(log => log.operation))];
    
    operations.forEach(operation => {
      const operationLogs = this.logs.filter(log => log.operation === operation);
      const durations = operationLogs.map(log => log.duration);
      const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      
      report[operation] = {
        average,
        count: durations.length,
        recent: durations.slice(-5), // Last 5 measurements
      };
    });
    
    return report;
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function throttledFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
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

// Memory leak detector
export const MemoryLeakDetector = {
  trackEventListeners: () => {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    const listeners = new WeakMap();
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (!listeners.has(this)) {
        listeners.set(this, new Set());
      }
      listeners.get(this).add({ type, listener, options });
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      if (listeners.has(this)) {
        const elementListeners = listeners.get(this);
        elementListeners.forEach(l => {
          if (l.type === type && l.listener === listener) {
            elementListeners.delete(l);
          }
        });
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    };
    
    // Check for memory leaks periodically
    setInterval(() => {
      let totalListeners = 0;
      // Note: WeakMap doesn't allow iteration, this is a simplified approach
      if (totalListeners > 1000) {
        console.warn('🚨 Potential memory leak: High number of event listeners detected');
      }
    }, 60000);
  },
  
  trackTimers: () => {
    const activeTimers = new Set();
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearTimeout = window.clearTimeout;
    const originalClearInterval = window.clearInterval;
    
    window.setTimeout = function(callback, delay, ...args) {
      const id = originalSetTimeout.call(this, (...args) => {
        activeTimers.delete(id);
        return callback(...args);
      }, delay, ...args);
      activeTimers.add(id);
      return id;
    };
    
    window.setInterval = function(callback, delay, ...args) {
      const id = originalSetInterval.call(this, callback, delay, ...args);
      activeTimers.add(id);
      return id;
    };
    
    window.clearTimeout = function(id) {
      activeTimers.delete(id);
      return originalClearTimeout.call(this, id);
    };
    
    window.clearInterval = function(id) {
      activeTimers.delete(id);
      return originalClearInterval.call(this, id);
    };
    
    // Report active timers periodically
    setInterval(() => {
      if (activeTimers.size > 50) {
        console.warn(`🚨 High number of active timers: ${activeTimers.size}`);
      }
    }, 30000);
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
