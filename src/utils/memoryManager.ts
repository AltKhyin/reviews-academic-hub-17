
// ABOUTME: Memory leak detection and cleanup utilities for React components
import { useEffect, useRef, useCallback } from 'react';

interface MemoryTracker {
  componentName: string;
  mountTime: number;
  subscriptions: Set<() => void>;
  eventListeners: Set<{ element: EventTarget; event: string; handler: EventListener }>;
  timers: Set<NodeJS.Timeout>;
}

class MemoryManager {
  private static trackedComponents = new Map<string, MemoryTracker>();
  private static memoryCheckInterval: NodeJS.Timeout | null = null;

  // Initialize memory monitoring
  static initialize() {
    if (this.memoryCheckInterval) return;

    // Check memory usage every 30 seconds
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  // Track component memory usage
  static trackComponent(componentName: string): MemoryTracker {
    const tracker: MemoryTracker = {
      componentName,
      mountTime: Date.now(),
      subscriptions: new Set(),
      eventListeners: new Set(),
      timers: new Set()
    };

    this.trackedComponents.set(componentName, tracker);
    return tracker;
  }

  // Clean up component tracking
  static untrackComponent(componentName: string) {
    const tracker = this.trackedComponents.get(componentName);
    if (tracker) {
      // Clean up subscriptions
      tracker.subscriptions.forEach(cleanup => cleanup());
      
      // Clean up event listeners
      tracker.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      
      // Clean up timers
      tracker.timers.forEach(timer => clearTimeout(timer));
      
      this.trackedComponents.delete(componentName);
    }
  }

  // Check for potential memory leaks
  private static checkMemoryUsage() {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const usagePercent = (usedMB / limitMB) * 100;

    console.log(`🧠 Memory Usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`);

    // Warn if memory usage is high
    if (usagePercent > 80) {
      console.warn('⚠️ High memory usage detected! Consider component cleanup.');
      this.suggestCleanup();
    }
  }

  // Suggest cleanup actions
  private static suggestCleanup() {
    const longRunningComponents = Array.from(this.trackedComponents.entries())
      .filter(([_, tracker]) => Date.now() - tracker.mountTime > 300000) // 5 minutes
      .map(([name]) => name);

    if (longRunningComponents.length > 0) {
      console.warn('🧹 Long-running components detected:', longRunningComponents);
    }
  }

  // Global cleanup
  static cleanup() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }

    this.trackedComponents.forEach((_, componentName) => {
      this.untrackComponent(componentName);
    });
  }
}

// Hook for automatic memory management
export const useMemoryManager = (componentName: string) => {
  const trackerRef = useRef<MemoryTracker | null>(null);

  useEffect(() => {
    // Initialize memory manager if not already done
    MemoryManager.initialize();
    
    // Track this component
    trackerRef.current = MemoryManager.trackComponent(componentName);

    return () => {
      // Clean up when component unmounts
      MemoryManager.untrackComponent(componentName);
    };
  }, [componentName]);

  // Helper to register cleanup functions
  const registerCleanup = useCallback((cleanup: () => void) => {
    if (trackerRef.current) {
      trackerRef.current.subscriptions.add(cleanup);
    }
  }, []);

  // Helper to register event listeners
  const registerEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    if (trackerRef.current) {
      element.addEventListener(event, handler);
      trackerRef.current.eventListeners.add({ element, event, handler });
    }
  }, []);

  // Helper to register timers
  const registerTimer = useCallback((timer: NodeJS.Timeout) => {
    if (trackerRef.current) {
      trackerRef.current.timers.add(timer);
    }
  }, []);

  return {
    registerCleanup,
    registerEventListener,
    registerTimer
  };
};

export { MemoryManager };
