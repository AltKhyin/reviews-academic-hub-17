// ABOUTME: Performance monitoring and profiling utilities for app optimization
// Provides memory leak detection, performance profiling, and measurement tools

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
}

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

class PerformanceProfiler {
  private static measurements = new Map<string, number>();
  private static metrics: PerformanceMetric[] = [];
  private static maxMetrics = 1000; // Prevent memory bloat

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
    
    // Store metric with memory management
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now()
    });

    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2);
    }

    return duration;
  }

  static getPerformanceReport(): Record<string, { average: number; count: number; total: number }> {
    const report: Record<string, { average: number; count: number; total: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!report[metric.operation]) {
        report[metric.operation] = { average: 0, count: 0, total: 0 };
      }
      report[metric.operation].total += metric.duration;
      report[metric.operation].count += 1;
    });

    // Calculate averages
    Object.keys(report).forEach(operation => {
      const data = report[operation];
      data.average = data.total / data.count;
    });

    return report;
  }

  static clearMetrics(): void {
    this.metrics = [];
    this.measurements.clear();
  }
}

class MemoryLeakDetector {
  private static eventListeners = new WeakMap();
  private static timers = new Set<number>();
  private static intervals = new Set<number>();

  static trackEventListeners(): void {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (!MemoryLeakDetector.eventListeners.has(this)) {
        MemoryLeakDetector.eventListeners.set(this, []);
      }
      MemoryLeakDetector.eventListeners.get(this).push({ type, listener, options });
      return originalAddEventListener.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      const listeners = MemoryLeakDetector.eventListeners.get(this);
      if (listeners) {
        const index = listeners.findIndex(l => l.type === type && l.listener === listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    };
  }

  static trackTimers(): void {
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearTimeout = window.clearTimeout;
    const originalClearInterval = window.clearInterval;

    window.setTimeout = function(callback, delay, ...args) {
      const id = originalSetTimeout.call(this, callback, delay, ...args);
      MemoryLeakDetector.timers.add(id);
      return id;
    };

    window.setInterval = function(callback, delay, ...args) {
      const id = originalSetInterval.call(this, callback, delay, ...args);
      MemoryLeakDetector.intervals.add(id);
      return id;
    };

    window.clearTimeout = function(id) {
      MemoryLeakDetector.timers.delete(id);
      return originalClearTimeout.call(this, id);
    };

    window.clearInterval = function(id) {
      MemoryLeakDetector.intervals.delete(id);
      return originalClearInterval.call(this, id);
    };
  }

  static getMemoryUsage(): MemoryUsage {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return { used: 0, total: 0, percentage: 0 };
  }

  static detectLeaks(): {
    activeTimers: number;
    activeIntervals: number;
    memoryUsage: MemoryUsage;
  } {
    return {
      activeTimers: this.timers.size,
      activeIntervals: this.intervals.size,
      memoryUsage: this.getMemoryUsage()
    };
  }

  static cleanup(): void {
    // Clear tracked timers and intervals
    this.timers.forEach(id => clearTimeout(id));
    this.intervals.forEach(id => clearInterval(id));
    this.timers.clear();
    this.intervals.clear();
  }
}

// Performance monitoring utilities
const performanceUtils = {
  measureFunction: <T extends (...args: any[]) => any>(fn: T, name: string): T => {
    return ((...args: any[]) => {
      PerformanceProfiler.startMeasurement(name);
      const result = fn(...args);
      PerformanceProfiler.endMeasurement(name);
      return result;
    }) as T;
  },

  measureAsyncFunction: <T extends (...args: any[]) => Promise<any>>(fn: T, name: string): T => {
    return (async (...args: any[]) => {
      PerformanceProfiler.startMeasurement(name);
      try {
        const result = await fn(...args);
        PerformanceProfiler.endMeasurement(name);
        return result;
      } catch (error) {
        PerformanceProfiler.endMeasurement(name);
        throw error;
      }
    }) as T;
  },

  debounce: <T extends (...args: any[]) => void>(func: T, wait: number): T => {
    let timeout: number;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    }) as T;
  },

  throttle: <T extends (...args: any[]) => void>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
};

export { PerformanceProfiler, MemoryLeakDetector, performanceUtils };
