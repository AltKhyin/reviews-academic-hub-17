
// ABOUTME: Optimized homepage context for unified data loading and zero-API-call sections
// Provides centralized data management for all homepage sections

import React, { createContext, useContext, ReactNode } from 'react';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';

interface OptimizedHomepageContextValue {
  issues: any[];
  featuredIssue: any | null;
  reviewerComments: any[];
  sectionVisibility: any[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const OptimizedHomepageContext = createContext<OptimizedHomepageContextValue | null>(null);

interface OptimizedHomepageProviderProps {
  children: ReactNode;
}

export const OptimizedHomepageProvider: React.FC<OptimizedHomepageProviderProps> = ({ children }) => {
  const {
    data: homepageData,
    isLoading,
    error,
    refetch
  } = useOptimizedHomepage();

  const contextValue: OptimizedHomepageContextValue = {
    issues: homepageData?.issues || [],
    featuredIssue: homepageData?.featuredIssue || null,
    reviewerComments: homepageData?.reviewerComments || [],
    sectionVisibility: homepageData?.sectionVisibility || [],
    isLoading,
    error,
    refetch
  };

  return (
    <OptimizedHomepageContext.Provider value={contextValue}>
      {children}
    </OptimizedHomepageContext.Provider>
  );
};

export const useOptimizedHomepageContext = () => {
  const context = useContext(OptimizedHomepageContext);
  if (!context) {
    throw new Error('useOptimizedHomepageContext must be used within OptimizedHomepageProvider');
  }
  return context;
};
