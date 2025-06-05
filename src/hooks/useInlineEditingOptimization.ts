
// ABOUTME: Performance optimization hook for inline editing components
// Provides debouncing, memoization, and efficient update patterns

import { useCallback, useRef, useMemo } from 'react';
import { debounce } from '@/lib/utils';

interface UseInlineEditingOptimizationProps {
  onUpdate?: (updates: any) => void;
  debounceMs?: number;
  enableMemoization?: boolean;
}

export const useInlineEditingOptimization = ({
  onUpdate,
  debounceMs = 300,
  enableMemoization = true
}: UseInlineEditingOptimizationProps = {}) => {
  
  const updateRef = useRef(onUpdate);
  updateRef.current = onUpdate;

  // Debounced update function to prevent excessive calls
  const debouncedUpdate = useMemo(
    () => debounce((updates: any) => {
      updateRef.current?.(updates);
    }, debounceMs),
    [debounceMs]
  );

  // Immediate update for critical changes
  const immediateUpdate = useCallback((updates: any) => {
    updateRef.current?.(updates);
  }, []);

  // Optimized field update with change detection
  const updateField = useCallback((field: string, value: any, immediate = false) => {
    const updates = { [field]: value };
    
    if (immediate) {
      immediateUpdate(updates);
    } else {
      debouncedUpdate(updates);
    }
  }, [debouncedUpdate, immediateUpdate]);

  // Batch multiple field updates
  const batchUpdate = useCallback((updates: Record<string, any>, immediate = false) => {
    if (immediate) {
      immediateUpdate(updates);
    } else {
      debouncedUpdate(updates);
    }
  }, [debouncedUpdate, immediateUpdate]);

  // Cancel pending debounced updates
  const cancelPendingUpdates = useCallback(() => {
    debouncedUpdate.cancel?.();
  }, [debouncedUpdate]);

  // Memoized value comparison to prevent unnecessary re-renders
  const hasChanged = useCallback((oldValue: any, newValue: any) => {
    if (typeof oldValue !== typeof newValue) return true;
    if (typeof oldValue === 'object' && oldValue !== null) {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    }
    return oldValue !== newValue;
  }, []);

  return {
    updateField,
    batchUpdate,
    immediateUpdate,
    debouncedUpdate,
    cancelPendingUpdates,
    hasChanged
  };
};

// Utility function for debouncing (if not available in utils)
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  
  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debounced;
}
