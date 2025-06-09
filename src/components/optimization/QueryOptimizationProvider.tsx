
// ABOUTME: Query optimization provider for centralized performance management
import React, { createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryOptimizationConfig {
  enableDebugLogging: boolean;
  defaultStaleTime?: number;
  defaultGcTime?: number;
}

const QueryOptimizationContext = createContext<QueryOptimizationConfig | null>(null);

// Create optimized query client with performance settings
const createOptimizedQueryClient = (config: QueryOptimizationConfig) => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: config.defaultStaleTime || 5 * 60 * 1000, // 5 minutes
        gcTime: config.defaultGcTime || 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

interface QueryOptimizationProviderProps {
  children: React.ReactNode;
  enableDebugLogging?: boolean;
  defaultStaleTime?: number;
  defaultGcTime?: number;
}

export const QueryOptimizationProvider: React.FC<QueryOptimizationProviderProps> = ({
  children,
  enableDebugLogging = false,
  defaultStaleTime,
  defaultGcTime,
}) => {
  const config: QueryOptimizationConfig = {
    enableDebugLogging,
    defaultStaleTime,
    defaultGcTime,
  };

  const queryClient = React.useMemo(
    () => createOptimizedQueryClient(config),
    [config.defaultStaleTime, config.defaultGcTime]
  );

  // Performance logging in development
  useEffect(() => {
    if (config.enableDebugLogging) {
      console.log('🚀 Query optimization enabled');
      
      // Log query cache statistics periodically
      const logInterval = setInterval(() => {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        const activeQueries = queries.filter(q => q.state.fetchStatus === 'fetching');
        
        console.log(`📊 Query Stats: ${queries.length} total, ${activeQueries.length} active`);
      }, 60000); // Every minute
      
      return () => clearInterval(logInterval);
    }
  }, [config.enableDebugLogging, queryClient]);

  return (
    <QueryOptimizationContext.Provider value={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        {config.enableDebugLogging && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            position="bottom-right"
          />
        )}
      </QueryClientProvider>
    </QueryOptimizationContext.Provider>
  );
};

export const useQueryOptimization = () => {
  const context = useContext(QueryOptimizationContext);
  if (!context) {
    throw new Error('useQueryOptimization must be used within QueryOptimizationProvider');
  }
  return context;
};
