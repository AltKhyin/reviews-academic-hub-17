// ABOUTME: Performance monitoring utilities for tracking optimization effectiveness
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'api' | 'render' | 'cache' | 'memory';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  recordMetric(name: string, value: number, category: PerformanceMetric['category']) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log performance warnings
    if (category === 'api' && value > 2000) {
      console.warn(`🐌 Slow API call: ${name} took ${value}ms`);
    } else if (category === 'render' && value > 16) {
      console.warn(`🖼️ Slow render: ${name} took ${value}ms`);
    }
  }

  getMetrics(category?: PerformanceMetric['category'], hours: number = 1): PerformanceMetric[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    return this.metrics.filter(metric => 
      metric.timestamp > cutoff &&
      (!category || metric.category === category)
    );
  }

  getAverageMetric(name: string, hours: number = 1): number {
    const metrics = this.getMetrics(undefined, hours).filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    
    return metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;
  }

  getSummary(): Record<string, any> {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > hourAgo);
    
    const summary = {
      totalMetrics: recentMetrics.length,
      categories: {} as Record<string, { count: number; avgValue: number }>,
      slowQueries: recentMetrics.filter(m => m.category === 'api' && m.value > 1000).length,
      fastQueries: recentMetrics.filter(m => m.category === 'api' && m.value < 100).length,
    };

    // Group by category
    const categoryGroups = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(categoryGroups).forEach(([category, values]) => {
      summary.categories[category] = {
        count: values.length,
        avgValue: values.reduce((sum, val) => sum + val, 0) / values.length,
      };
    });

    return summary;
  }

  measureAPICall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return apiCall().then(result => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'api');
      return result;
    }).catch(error => {
      const duration = performance.now() - startTime;
      this.recordMetric(`${name}_ERROR`, duration, 'api');
      throw error;
    });
  }

  measureRender<T>(name: string, renderFn: () => T): T {
    const startTime = performance.now();
    const result = renderFn();
    const duration = performance.now() - startTime;
    this.recordMetric(name, duration, 'render');
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Hook for easy access to performance monitoring
export const usePerformanceMonitor = () => {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getAverageMetric: performanceMonitor.getAverageMetric.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor),
    measureAPICall: performanceMonitor.measureAPICall.bind(performanceMonitor),
    measureRender: performanceMonitor.measureRender.bind(performanceMonitor),
  };
};
