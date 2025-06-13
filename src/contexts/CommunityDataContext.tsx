
// ABOUTME: Community data context provider for centralized data management
// Eliminates individual API calls and provides shared data access
import React, { createContext, useContext } from 'react';
import { useCommunityDataLoader, CommunityDataState } from '@/hooks/useCommunityDataLoader';

const CommunityDataContext = createContext<CommunityDataState | undefined>(undefined);

export const CommunityDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const communityData = useCommunityDataLoader();

  return (
    <CommunityDataContext.Provider value={communityData}>
      {children}
    </CommunityDataContext.Provider>
  );
};

export const useCommunityData = (): CommunityDataState => {
  const context = useContext(CommunityDataContext);
  if (context === undefined) {
    throw new Error('useCommunityData must be used within a CommunityDataProvider');
  }
  return context;
};
