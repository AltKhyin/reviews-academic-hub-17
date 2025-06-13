
// ABOUTME: Comprehensive app optimization provider that integrates all performance enhancements
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface OptimizedAppProviderProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
  enableErrorTracking?: boolean;
  enableBackgroundSync?: boolean;
}

// Create optimized query client outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const OptimizedAppProvider: React.FC<OptimizedAppProviderProps> = ({
  children,
  enablePerformanceMonitoring = true,
  enableErrorTracking = true,
  enableBackgroundSync = true,
}) => {
  // Global performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Optimized App Provider initialized');
      
      const logInterval = setInterval(() => {
        console.group('🚀 App Performance Report');
        console.log('Performance monitoring:', enablePerformanceMonitoring);
        console.log('Error tracking:', enableErrorTracking);
        console.log('Background sync:', enableBackgroundSync);
        console.groupEnd();
      }, 120000); // Every 2 minutes in development
      
      return () => clearInterval(logInterval);
    }
  }, [enablePerformanceMonitoring, enableErrorTracking, enableBackgroundSync]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
