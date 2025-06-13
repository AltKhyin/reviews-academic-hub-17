
// ABOUTME: Memory leak detection and optimization for React components
import { useEffect, useRef, useCallback } from 'react';

interface MemoryMetrics {
  componentName: string;
  mountTime: number;
  peakMemory: number;
  currentMemory: number;
  leakDetected: boolean;
}

export const useMemoryOptimizer = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const listenersRef = useRef<Map<string, EventListener>>(new Map());
  const subscriptionsRef = useRef<Set<() => void>>(new Set());

  // Memory monitoring
  const checkMemoryUsage = useCallback(() => {
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory;
      const currentMemory = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      // Detect potential memory leaks (basic heuristic)
      const mountDuration = Date.now() - mountTimeRef.current;
      const expectedMemory = 5 + (mountDuration / 60000) * 2; // 5MB base + 2MB per minute
      
      if (currentMemory > expectedMemory * 2) {
        console.warn(`🚨 Potential memory leak in ${componentName}: ${currentMemory.toFixed(2)}MB`);
        return true;
      }
    }
    return false;
  }, [componentName]);

  // Safe interval registration
  const registerInterval = useCallback((callback: () => void, ms: number) => {
    const interval = setInterval(callback, ms);
    intervalsRef.current.add(interval);
    return interval;
  }, []);

  // Safe event listener registration
  const registerEventListener = useCallback((
    element: EventTarget,
    event: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, listener, options);
    listenersRef.current.set(`${event}-${Date.now()}`, listener);
    
    return () => {
      element.removeEventListener(event, listener, options);
      listenersRef.current.delete(`${event}-${Date.now()}`);
    };
  }, []);

  // Safe subscription registration (for Supabase, etc.)
  const registerSubscription = useCallback((unsubscribe: () => void) => {
    subscriptionsRef.current.add(unsubscribe);
    return unsubscribe;
  }, []);

  // Cleanup all resources
  const cleanup = useCallback(() => {
    // Clear intervals
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current.clear();

    // Remove event listeners
    listenersRef.current.clear();

    // Unsubscribe from all subscriptions
    subscriptionsRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
      }
    });
    subscriptionsRef.current.clear();
  }, []);

  // Component cleanup on unmount
  useEffect(() => {
    // Memory monitoring interval
    const memoryCheckInterval = registerInterval(() => {
      checkMemoryUsage();
    }, 30000); // Check every 30 seconds

    return () => {
      cleanup();
      clearInterval(memoryCheckInterval);
    };
  }, [cleanup, registerInterval, checkMemoryUsage]);

  return {
    registerInterval,
    registerEventListener,
    registerSubscription,
    checkMemoryUsage,
    cleanup,
  };
};

// Global memory monitoring hook
export const useGlobalMemoryMonitor = () => {
  useEffect(() => {
    let isMonitoring = true;
    
    const monitorMemory = () => {
      if (!isMonitoring) return;
      
      if (typeof (performance as any).memory !== 'undefined') {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / 1024 / 1024; // MB
        const total = memory.totalJSHeapSize / 1024 / 1024; // MB
        const limit = memory.jsHeapSizeLimit / 1024 / 1024; // MB
        
        // Log memory usage in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`💾 Memory: ${used.toFixed(1)}MB used, ${total.toFixed(1)}MB total, ${limit.toFixed(1)}MB limit`);
        }
        
        // Alert if memory usage is high
        if (used > 100) { // 100MB threshold
          console.warn(`🚨 High memory usage detected: ${used.toFixed(1)}MB`);
        }
      }
      
      // Schedule next check
      setTimeout(monitorMemory, 60000); // Every minute
    };
    
    // Start monitoring after initial mount
    setTimeout(monitorMemory, 5000);
    
    return () => {
      isMonitoring = false;
    };
  }, []);
};
