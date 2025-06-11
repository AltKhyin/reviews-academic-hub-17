
// ABOUTME: Parallel data loading system with intelligent error recovery
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Issue } from '@/types/issue';
import { Section } from '@/hooks/useSectionVisibility';

export interface ReviewerComment {
  id: string;
  reviewer_name: string;
  comment: string;
  created_at: string;
  reviewer_avatar?: string;
}

export interface SectionVisibilityConfig {
  id: string;
  visible: boolean;
  order: number;
}

export interface ParallelDataState {
  issues: Issue[];
  sectionVisibility: SectionVisibilityConfig[];
  reviewerComments: ReviewerComment[];
  featuredIssue: Issue | null;
  isLoading: boolean;
  errors: Record<string, Error>;
  retryFailed: () => void;
}

interface DataLoader {
  key: string;
  loader: () => Promise<any>;
  critical: boolean;
}

export const useParallelDataLoader = (): ParallelDataState => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [state, setState] = useState<ParallelDataState>({
    issues: [],
    sectionVisibility: [],
    reviewerComments: [],
    featuredIssue: null,
    isLoading: true,
    errors: {},
    retryFailed: () => {},
  });

  // Define data loaders
  const dataLoaders: DataLoader[] = [
    {
      key: 'issues',
      loader: async () => {
        // Mock loader - replace with actual implementation
        return [];
      },
      critical: true,
    },
    {
      key: 'sectionVisibility',
      loader: async () => {
        // Mock loader - replace with actual implementation
        return [];
      },
      critical: false,
    },
    {
      key: 'reviewerComments',
      loader: async () => {
        // Mock loader - replace with actual implementation
        return [];
      },
      critical: false,
    },
    {
      key: 'featuredIssue',
      loader: async () => {
        // Mock loader - replace with actual implementation
        return null;
      },
      critical: true,
    },
  ];

  // Execute parallel data loading
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, errors: {} }));

    const results = await Promise.allSettled(
      dataLoaders.map(async loader => ({
        key: loader.key,
        data: await loader.loader(),
        critical: loader.critical,
      }))
    );

    const newState: Partial<ParallelDataState> = { isLoading: false, errors: {} };
    const errors: Record<string, Error> = {};

    results.forEach((result, index) => {
      const loader = dataLoaders[index];
      
      if (result.status === 'fulfilled') {
        (newState as any)[loader.key] = result.value.data;
      } else {
        errors[loader.key] = result.reason;
        
        // Set defaults for failed loads
        switch (loader.key) {
          case 'issues':
            (newState as any)[loader.key] = [];
            break;
          case 'sectionVisibility':
            (newState as any)[loader.key] = [];
            break;
          case 'reviewerComments':
            (newState as any)[loader.key] = [];
            break;
          case 'featuredIssue':
            (newState as any)[loader.key] = null;
            break;
        }
      }
    });

    newState.errors = errors;
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Retry failed data loads
  const retryFailed = useCallback(() => {
    loadData();
  }, [loadData]);

  // Load data on mount and auth changes
  useEffect(() => {
    loadData();
  }, [loadData, isAuthenticated]);

  return {
    ...state,
    retryFailed,
  };
};
