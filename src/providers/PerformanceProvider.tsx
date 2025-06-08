
// ABOUTME: Global performance provider that initializes all performance optimization systems
import React, { useEffect } from 'react';
import { usePerformanceOptimizer } from '@/hooks/usePerformanceOptimizer';
import { useIntelligentPrefetch } from '@/hooks/useIntelligentPrefetch';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { MemoryLeakDetector, PerformanceProfiler } from '@/utils/performanceHelpers';

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableDashboard?: boolean;
  enableMemoryLeakDetection?: boolean;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  enableDashboard = process.env.NODE_ENV === 'development',
  enableMemoryLeakDetection = true,
}) => {
  // Initialize performance systems
  usePerformanceOptimizer();
  useIntelligentPrefetch();

  useEffect(() => {
    // Initialize memory leak detection
    if (enableMemoryLeakDetection) {
      MemoryLeakDetector.trackEventListeners();
      MemoryLeakDetector.trackTimers();
    }

    // Start performance profiling
    PerformanceProfiler.startMeasurement('app-initialization');
    
    return () => {
      PerformanceProfiler.endMeasurement('app-initialization');
    };
  }, [enableMemoryLeakDetection]);

  // Report performance metrics periodically in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const report = PerformanceProfiler.getPerformanceReport();
        if (Object.keys(report).length > 0) {
          console.group('📊 Performance Report');
          Object.entries(report).forEach(([operation, data]) => {
            console.log(`${operation}: ${data.average.toFixed(2)}ms avg (${data.count} samples)`);
          });
          console.groupEnd();
        }
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <>
      {children}
      {enableDashboard && <PerformanceDashboard />}
    </>
  );
};
