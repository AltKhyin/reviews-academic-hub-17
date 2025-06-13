
// ABOUTME: Unified performance management system replacing three overlapping monitoring systems
// Consolidates useUnifiedPerformance, useUnifiedQuery, and performanceHelpers into single efficient system

interface PerformanceMetrics {
  requestCount: number;
  memoryUsage: number;
  cacheHitRate: number;
  loadTime: number;
  timestamp: number;
}

interface RequestBudgetStatus {
  current: number;
  maximum: number;
  remaining: number;
  exceeded: boolean;
}

interface ComponentPerformanceData {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  memoryFootprint: number;
}

class UnifiedPerformanceManager {
  private static instance: UnifiedPerformanceManager;
  private metrics: PerformanceMetrics[] = [];
  private componentMetrics = new Map<string, ComponentPerformanceData>();
  private requestBudget: RequestBudgetStatus = {
    current: 0,
    maximum: 10,
    remaining: 10,
    exceeded: false
  };
  
  // Lightweight metric collection (replacing heavy monitoring)
  private metricsCollectionInterval: NodeJS.Timeout | null = null;
  private readonly METRICS_RETENTION_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly COLLECTION_INTERVAL = 30 * 1000; // 30 seconds

  private constructor() {
    this.initializeLightweightMonitoring();
  }

  static getInstance(): UnifiedPerformanceManager {
    if (!UnifiedPerformanceManager.instance) {
      UnifiedPerformanceManager.instance = new UnifiedPerformanceManager();
    }
    return UnifiedPerformanceManager.instance;
  }

  // PERFORMANCE OPTIMIZATION: Lightweight initialization
  private initializeLightweightMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Efficient metrics collection (replaces heavy monitoring systems)
    this.metricsCollectionInterval = setInterval(() => {
      this.collectEssentialMetrics();
      this.cleanupOldMetrics();
    }, this.COLLECTION_INTERVAL);

    console.log('🎯 UnifiedPerformanceManager: Lightweight monitoring initialized');
  }

  // MEMORY OPTIMIZATION: Collect only essential metrics
  private collectEssentialMetrics(): void {
    const now = Date.now();
    
    // Essential performance data only
    const metrics: PerformanceMetrics = {
      requestCount: this.requestBudget.current,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.getCacheHitRate(),
      loadTime: this.getPageLoadTime(),
      timestamp: now
    };

    this.metrics.push(metrics);
    
    // Efficient memory management
    if (this.metrics.length > 10) {
      this.metrics = this.metrics.slice(-10); // Keep only last 10 metrics
    }
  }

  // REQUEST BUDGET MANAGEMENT
  trackRequest(endpoint: string): boolean {
    this.requestBudget.current++;
    this.requestBudget.remaining = Math.max(0, this.requestBudget.maximum - this.requestBudget.current);
    this.requestBudget.exceeded = this.requestBudget.current > this.requestBudget.maximum;

    if (this.requestBudget.exceeded) {
      console.warn(`🚨 Request budget exceeded: ${this.requestBudget.current}/${this.requestBudget.maximum} for ${endpoint}`);
      return false;
    }

    console.log(`📊 Request tracked: ${this.requestBudget.current}/${this.requestBudget.maximum} - ${endpoint}`);
    return true;
  }

  resetRequestBudget(): void {
    this.requestBudget.current = 0;
    this.requestBudget.remaining = this.requestBudget.maximum;
    this.requestBudget.exceeded = false;
  }

  // COMPONENT PERFORMANCE TRACKING
  trackComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.averageRenderTime = (existing.averageRenderTime + renderTime) / 2;
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: 1,
        averageRenderTime: renderTime,
        memoryFootprint: 0 // Will be updated separately
      });
    }
  }

  // EFFICIENT METRIC ACCESSORS
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getRequestBudgetStatus(): RequestBudgetStatus {
    return { ...this.requestBudget };
  }

  getComponentMetrics(): ComponentPerformanceData[] {
    return Array.from(this.componentMetrics.values());
  }

  // MEMORY FOOTPRINT CALCULATION
  getMemoryFootprint(): number {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return 0;
    }

    const memory = (window.performance as any).memory;
    if (!memory) return 0;

    // Return memory usage in MB
    return Math.round(memory.usedJSHeapSize / (1024 * 1024));
  }

  // CACHE EFFICIENCY MONITORING
  private getCacheHitRate(): number {
    // Simple cache hit rate calculation
    // This would integrate with RequestCoordinator cache metrics
    return 0.85; // Placeholder - will be connected to actual cache
  }

  // PAGE LOAD TIME TRACKING
  private getPageLoadTime(): number {
    if (typeof window === 'undefined') return 0;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return 0;
    
    return navigation.loadEventEnd - navigation.fetchStart;
  }

  // MEMORY EFFICIENCY: Get current memory usage
  private getMemoryUsage(): number {
    return this.getMemoryFootprint();
  }

  // CLEANUP OLD METRICS
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.METRICS_RETENTION_TIME;
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  // PERFORMANCE SUMMARY
  getPerformanceSummary(): {
    currentMemoryMB: number;
    requestBudgetStatus: RequestBudgetStatus;
    recentMetrics: PerformanceMetrics[];
    topComponents: ComponentPerformanceData[];
  } {
    return {
      currentMemoryMB: this.getMemoryFootprint(),
      requestBudgetStatus: this.getRequestBudgetStatus(),
      recentMetrics: this.metrics.slice(-5), // Last 5 metrics
      topComponents: this.getComponentMetrics()
        .sort((a, b) => b.renderCount - a.renderCount)
        .slice(0, 5) // Top 5 most active components
    };
  }

  // AUTOMATIC OPTIMIZATION
  performMaintenanceOptimization(): void {
    // Clean up old metrics
    this.cleanupOldMetrics();
    
    // Reset request budget if needed
    const lastReset = this.metrics[this.metrics.length - 1]?.timestamp || 0;
    const timeSinceReset = Date.now() - lastReset;
    
    if (timeSinceReset > 60000) { // Reset every minute
      this.resetRequestBudget();
    }

    console.log('🔧 UnifiedPerformanceManager: Maintenance optimization completed');
  }

  // SHUTDOWN CLEANUP
  destroy(): void {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }
    
    this.metrics = [];
    this.componentMetrics.clear();
    
    console.log('🧹 UnifiedPerformanceManager: Cleanup completed');
  }
}

// Export singleton instance
export const unifiedPerformanceManager = UnifiedPerformanceManager.getInstance();

// Hook for React components to use unified performance management
export const useUnifiedPerformance = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [budgetStatus, setBudgetStatus] = React.useState<RequestBudgetStatus>(
    unifiedPerformanceManager.getRequestBudgetStatus()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(unifiedPerformanceManager.getCurrentMetrics());
      setBudgetStatus(unifiedPerformanceManager.getRequestBudgetStatus());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    budgetStatus,
    trackRequest: (endpoint: string) => unifiedPerformanceManager.trackRequest(endpoint),
    trackComponentRender: (name: string, time: number) => 
      unifiedPerformanceManager.trackComponentRender(name, time),
    getPerformanceSummary: () => unifiedPerformanceManager.getPerformanceSummary()
  };
};

import React from 'react';
