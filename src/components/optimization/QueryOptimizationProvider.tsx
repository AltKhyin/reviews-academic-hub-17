
// ABOUTME: Query optimization provider that integrates all performance enhancements
import React, { useEffect } from 'react';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { initializeBackgroundOptimization, cleanupBackgroundOptimization } from '@/lib/queryClient';

interface QueryOptimizationProviderProps {
  children: React.ReactNode;
  enableDebugLogging?: boolean;
}

export const QueryOptimizationProvider: React.FC<QueryOptimizationProviderProps> = ({
  children,
  enableDebugLogging = false
}) => {
  // Initialize background sync
  const { triggerSync, isEnabled } = useBackgroundSync({
    enablePrefetch: true,
    enablePeriodicSync: true,
    enableVisibilitySync: true,
    prefetchCriticalData: true,
  });

  // Initialize optimization systems
  useEffect(() => {
    // Start background optimization
    initializeBackgroundOptimization();
    
    if (enableDebugLogging) {
      console.log('Query optimization provider initialized');
      console.log('Background sync enabled:', isEnabled);
    }
    
    // Cleanup on unmount
    return () => {
      cleanupBackgroundOptimization();
      if (enableDebugLogging) {
        console.log('Query optimization provider cleaned up');
      }
    };
  }, [isEnabled, enableDebugLogging]);

  // Performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && enableDebugLogging) {
      const logPerformance = () => {
        console.group('Query Performance Report');
        console.log('Background sync enabled:', isEnabled);
        console.log('Manual sync available via triggerSync()');
        console.groupEnd();
      };
      
      const performanceInterval = setInterval(logPerformance, 60000); // Every minute
      
      return () => clearInterval(performanceInterval);
    }
  }, [isEnabled, triggerSync, enableDebugLogging]);

  return <>{children}</>;
};
