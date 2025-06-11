// ABOUTME: Enhanced error boundary hook with intelligent error reporting and recovery
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

const MAX_RETRIES = 3;
const ERROR_STORAGE_KEY = 'app_error_history';

export const useEnhancedErrorBoundary = () => {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  });

  const logError = useCallback((error: Error, errorInfo?: any) => {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Store error locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || '[]');
      existingErrors.push(errorData);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(recentErrors));
    } catch (storageError) {
      console.warn('Failed to store error in localStorage:', storageError);
    }

    // Log to console with structured data
    console.error('Enhanced Error Boundary caught an error:', {
      error,
      errorInfo: errorData,
      state: {
        retryCount: state.retryCount,
        hasError: state.hasError,
      },
    });

    setState(prev => ({
      ...prev,
      hasError: true,
      error,
      errorInfo: errorData,
    }));
  }, [state.retryCount, state.hasError]);

  const handleError = useCallback((error: Error, errorInfo?: any) => {
    logError(error, errorInfo);

    // Determine error severity and response
    const isCritical = error.message.includes('ChunkLoadError') || 
                      error.message.includes('Loading chunk') ||
                      error.message.includes('Failed to fetch dynamically imported module');

    if (isCritical) {
      toast({
        title: "Application Update Available",
        description: "Please refresh the page to get the latest version.",
        variant: "default",
        duration: 10000,
      });
    } else if (state.retryCount < MAX_RETRIES) {
      toast({
        title: "Something went wrong",
        description: `Error: ${error.message.slice(0, 100)}... (Retry ${state.retryCount + 1}/${MAX_RETRIES})`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Persistent Error",
        description: "Multiple errors occurred. Please refresh the page.",
        variant: "destructive",
        duration: 15000,
      });
    }
  }, [logError, state.retryCount]);

  const retry = useCallback(() => {
    if (state.retryCount < MAX_RETRIES) {
      setState(prev => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prev.retryCount + 1,
      }));

      console.log(`Retrying after error (attempt ${state.retryCount + 1}/${MAX_RETRIES})`);
    } else {
      console.error('Max retries reached, requiring manual refresh');
      window.location.reload();
    }
  }, [state.retryCount]);

  const reset = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  }, []);

  const getStoredErrors = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }, []);

  const clearStoredErrors = useCallback(() => {
    localStorage.removeItem(ERROR_STORAGE_KEY);
  }, []);

  // Auto-retry for specific error types
  useEffect(() => {
    if (state.hasError && state.error) {
      const autoRetryableErrors = [
        'Network request failed',
        'Failed to fetch',
        'Load failed',
      ];

      const isAutoRetryable = autoRetryableErrors.some(pattern => 
        state.error?.message.includes(pattern)
      );

      if (isAutoRetryable && state.retryCount < 2) {
        const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 5000);
        const timer = setTimeout(retry, retryDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [state.hasError, state.error, state.retryCount, retry]);

  return {
    ...state,
    handleError,
    retry,
    reset,
    getStoredErrors,
    clearStoredErrors,
    canRetry: state.retryCount < MAX_RETRIES,
  };
};
