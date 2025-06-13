
// ABOUTME: Shared data provider to prevent individual component API calls in lists
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOptimizedHomepage } from '@/hooks/useOptimizedHomepage';
import { useUserInteractionContext } from './UserInteractionContext';

interface SharedDataContextType {
  issues: any[];
  featuredIssue: any | null;
  reviewerComments: any[];
  sectionVisibility: any[];
  isLoading: boolean;
  error: any;
  refreshData: () => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export const SharedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, error, refetch } = useOptimizedHomepage();
  const { batchLoadUserData } = useUserInteractionContext();
  const [dataLoaded, setDataLoaded] = useState(false);

  // Batch load user interactions when data becomes available
  useEffect(() => {
    if (data?.issues && !dataLoaded && data.issues.length > 0) {
      const issueIds = data.issues.map((issue: any) => issue.id);
      batchLoadUserData(issueIds);
      setDataLoaded(true);
      console.log(`🚀 Batch loaded user data for ${issueIds.length} issues from SharedDataProvider`);
    }
  }, [data?.issues, batchLoadUserData, dataLoaded]);

  const refreshData = useCallback(() => {
    setDataLoaded(false);
    refetch();
  }, [refetch]);

  const contextValue = {
    issues: data?.issues || [],
    featuredIssue: data?.featuredIssue || null,
    reviewerComments: data?.reviewerComments || [],
    sectionVisibility: data?.sectionVisibility || [],
    isLoading,
    error,
    refreshData
  };

  return (
    <SharedDataContext.Provider value={contextValue}>
      {children}
    </SharedDataContext.Provider>
  );
};

export const useSharedData = () => {
  const context = useContext(SharedDataContext);
  if (!context) {
    throw new Error('useSharedData must be used within SharedDataProvider');
  }
  return context;
};
