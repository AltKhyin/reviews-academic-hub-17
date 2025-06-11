
// ABOUTME: Query client initialization and background optimization utilities
import { QueryClient } from '@tanstack/react-query';

let backgroundOptimizationInterval: NodeJS.Timeout | null = null;

export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

export const initializeBackgroundOptimization = () => {
  if (backgroundOptimizationInterval) {
    clearInterval(backgroundOptimizationInterval);
  }

  backgroundOptimizationInterval = setInterval(() => {
    // Background optimization logic
    console.log('🔄 Running background optimization');
    
    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }, 300000); // Every 5 minutes

  console.log('✅ Background optimization initialized');
};

export const cleanupBackgroundOptimization = () => {
  if (backgroundOptimizationInterval) {
    clearInterval(backgroundOptimizationInterval);
    backgroundOptimizationInterval = null;
  }
  
  console.log('🧹 Background optimization cleaned up');
};
