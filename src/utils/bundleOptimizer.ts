
// ABOUTME: Bundle size optimization utilities for performance enhancement
import { lazy, LazyExoticComponent, ComponentType } from 'react';

interface BundleAnalytics {
  componentName: string;
  loadTime: number;
  size?: number;
  error?: string;
}

class BundleOptimizer {
  private static analytics: BundleAnalytics[] = [];
  private static loadingComponents = new Set<string>();

  // Create optimized lazy loading with analytics
  static createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string
  ): LazyExoticComponent<T> {
    return lazy(async () => {
      const startTime = performance.now();
      this.loadingComponents.add(componentName);

      try {
        const module = await importFn();
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        this.analytics.push({
          componentName,
          loadTime,
        });

        console.log(`📦 Lazy loaded ${componentName} in ${loadTime.toFixed(2)}ms`);
        
        return module;
      } catch (error) {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        this.analytics.push({
          componentName,
          loadTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        console.error(`❌ Failed to load ${componentName}:`, error);
        throw error;
      } finally {
        this.loadingComponents.delete(componentName);
      }
    });
  }

  // Preload critical components during idle time
  static preloadCriticalComponents() {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Preload archive components (user is likely to visit)
        import('../components/archive/OptimizedMasonryGrid');
        import('../components/archive/IssueCard');
        
        // Preload community components
        import('../components/community/PostsList');
        
        console.log('🚀 Preloaded critical components during idle time');
      });
    }
  }

  // Get bundle analytics for performance monitoring
  static getAnalytics(): BundleAnalytics[] {
    return [...this.analytics];
  }

  // Check currently loading components
  static getLoadingComponents(): string[] {
    return Array.from(this.loadingComponents);
  }

  // Clear analytics (for memory management)
  static clearAnalytics() {
    this.analytics = [];
  }
}

// Optimized dynamic imports for large dependencies
export const optimizedImports = {
  // Editor components (large bundle)
  NativeEditor: () => BundleOptimizer.createLazyComponent(
    () => import('../components/editor/NativeEditor'),
    'NativeEditor'
  ),
  
  // Analytics dashboard (large charts bundle)
  AnalyticsDashboard: () => BundleOptimizer.createLazyComponent(
    () => import('../components/analytics/EnhancedAnalyticsDashboard'),
    'AnalyticsDashboard'
  ),
  
  // Admin components (rarely accessed)
  AdminPanel: () => BundleOptimizer.createLazyComponent(
    () => import('../components/admin/IssuesManagementPanel'),
    'AdminPanel'
  ),
  
  // PDF viewer (heavy dependency)
  PDFViewer: () => BundleOptimizer.createLazyComponent(
    () => import('../components/pdf/PDFViewer'),
    'PDFViewer'
  ),
};

export default BundleOptimizer;
