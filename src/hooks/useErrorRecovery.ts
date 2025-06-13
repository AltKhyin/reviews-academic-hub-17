
// ABOUTME: Hook for error recovery and retry logic
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export const useErrorRecovery = (options: ErrorRecoveryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    showToast = true
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const executeWithRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    try {
      setIsRetrying(false);
      const result = await operation();
      
      // Reset retry count on success
      if (retryCount > 0) {
        setRetryCount(0);
        setLastError(null);
      }
      
      return result;
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Error in ${context || 'operation'}:`, err);
      
      setLastError(err);
      
      if (onError) {
        onError(err);
      }

      // Check if we should retry
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setIsRetrying(true);

        if (showToast) {
          toast({
            title: 'Erro detectado',
            description: `Tentando novamente... (${retryCount + 1}/${maxRetries})`,
            variant: 'destructive',
          });
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Recursive retry
        return executeWithRecovery(operation, context);
      } else {
        // Max retries reached
        setIsRetrying(false);
        
        if (showToast) {
          toast({
            title: 'Erro persistente',
            description: `Não foi possível completar a operação após ${maxRetries} tentativas.`,
            variant: 'destructive',
          });
        }
        
        throw err;
      }
    }
  }, [retryCount, maxRetries, retryDelay, onError, showToast]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, []);

  return {
    executeWithRecovery,
    retryCount,
    isRetrying,
    lastError,
    reset,
    canRetry: retryCount < maxRetries
  };
};
