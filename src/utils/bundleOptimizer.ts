
// ABOUTME: Bundle size optimization utilities for performance monitoring and lazy loading
import { ComponentType, lazy } from 'react';
import { PerformanceProfiler } from '@/utils/performanceHelpers';

interface BundleAnalytics {
  chunkName: string;
  loadTime: number;
  size?: number;
  cached: boolean;
}

class BundleOptimizer {
  private static loadedChunks = new Map<string, boolean>();
  private static analytics: BundleAnalytics[] = [];

  // Create optimized lazy component with analytics
  static createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    chunkName: string
  ) {
    return lazy(async () => {
      const startTime = performance.now();
      const isCached = this.loadedChunks.has(chunkName);
      
      try {
        PerformanceProfiler.startMeasurement(`bundle-${chunkName}`);
        const component = await importFn();
        const loadTime = performance.now() - startTime;
        
        // Track bundle loading analytics
        this.analytics.push({
          chunkName,
          loadTime,
          cached: isCached
        });
        
        this.loadedChunks.set(chunkName, true);
        PerformanceProfiler.endMeasurement(`bundle-${chunkName}`);
        
        console.log(`📦 Bundle loaded: ${chunkName} (${loadTime.toFixed(2)}ms)`);
        return component;
      } catch (error) {
        console.error(`❌ Bundle load failed: ${chunkName}`, error);
        throw error;
      }
    });
  }

  // Preload critical chunks during idle time
  static preloadChunk(importFn: () => Promise<any>, chunkName: string) {
    if (this.loadedChunks.has(chunkName)) return;

    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn().then(() => {
          this.loadedChunks.set(chunkName, true);
          console.log(`🚀 Preloaded chunk: ${chunkName}`);
        }).catch(() => {
          console.warn(`⚠️ Preload failed: ${chunkName}`);
        });
      }, { timeout: 5000 });
    }
  }

  // Get bundle analytics
  static getBundleAnalytics() {
    return {
      totalChunks: this.analytics.length,
      averageLoadTime: this.analytics.reduce((sum, item) => sum + item.loadTime, 0) / this.analytics.length || 0,
      cacheHitRate: this.analytics.filter(item => item.cached).length / this.analytics.length || 0,
      analytics: [...this.analytics]
    };
  }

  // Optimized imports for heavy components
  static getOptimizedImports() {
    return {
      // Editor components (heavy)
      NativeEditor: this.createLazyComponent(
        () => import('@/components/editor/NativeEditor').then(m => ({ default: m.NativeEditor || m.default })),
        'native-editor'
      ),
      
      // Analytics dashboard (heavy)
      EnhancedAnalyticsDashboard: this.createLazyComponent(
        () => import('@/components/analytics/EnhancedAnalyticsDashboard').then(m => ({ default: m.EnhancedAnalyticsDashboard || m.default })),
        'analytics-dashboard'
      ),
      
      // Admin panels (heavy)
      IssuesManagementPanel: this.createLazyComponent(
        () => import('@/components/admin/IssuesManagementPanel').then(m => ({ default: m.IssuesManagementPanel || m.default })),
        'issues-management'
      ),
      
      // PDF viewer (heavy)
      PDFViewer: this.createLazyComponent(
        () => import('@/components/pdf/PDFViewer').then(m => ({ default: m.PDFViewer || m.default })),
        'pdf-viewer'
      )
    };
  }
}

export { BundleOptimizer };
