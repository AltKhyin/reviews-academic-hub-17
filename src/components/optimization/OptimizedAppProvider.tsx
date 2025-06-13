
// ABOUTME: Optimized app provider for performance monitoring and cascade prevention
import React, { createContext, useContext, useState, useEffect } from 'react';

interface OptimizedAppContextType {
  isOptimized: boolean;
  performanceMetrics: {
    requestCount: number;
    lastResetTime: number;
  };
  resetMetrics: () => void;
}

const OptimizedAppContext = createContext<OptimizedAppContextType | undefined>(undefined);

export const OptimizedAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    requestCount: 0,
    lastResetTime: Date.now()
  });

  const resetMetrics = () => {
    setPerformanceMetrics({
      requestCount: 0,
      lastResetTime: Date.now()
    });
  };

  // Reset metrics every 5 minutes
  useEffect(() => {
    const interval = setInterval(resetMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const contextValue = {
    isOptimized: true,
    performanceMetrics,
    resetMetrics
  };

  return (
    <OptimizedAppContext.Provider value={contextValue}>
      {children}
    </OptimizedAppContext.Provider>
  );
};

export const useOptimizedApp = () => {
  const context = useContext(OptimizedAppContext);
  if (!context) {
    throw new Error('useOptimizedApp must be used within OptimizedAppProvider');
  }
  return context;
};
