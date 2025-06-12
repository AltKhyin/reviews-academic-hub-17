
// ABOUTME: Parallel data loading system with intelligent error recovery and real data implementation
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';

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

  // Load issues from database
  const loadIssues = async (): Promise<Issue[]> => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading issues:', error);
      return [];
    }
  };

  // Load section visibility settings
  const loadSectionVisibility = async (): Promise<SectionVisibilityConfig[]> => {
    try {
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'home_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value && typeof data.value === 'object') {
        const value = data.value as any;
        const sectionsConfig = value.sections || {};
        
        // Convert to array format expected by UI
        return Object.entries(sectionsConfig).map(([id, config]: [string, any]) => ({
          id,
          visible: config?.visible ?? true,
          order: config?.order ?? 0
        }));
      }

      // Return default configuration if no settings found
      return [
        { id: 'reviewer', visible: true, order: 0 },
        { id: 'featured', visible: true, order: 1 },
        { id: 'upcoming', visible: true, order: 2 },
        { id: 'recent', visible: true, order: 3 },
        { id: 'recommended', visible: true, order: 4 },
        { id: 'trending', visible: true, order: 5 }
      ];
    } catch (error) {
      console.error('Error loading section visibility:', error);
      // Return default sections on error
      return [
        { id: 'reviewer', visible: true, order: 0 },
        { id: 'featured', visible: true, order: 1 },
        { id: 'upcoming', visible: true, order: 2 },
        { id: 'recent', visible: true, order: 3 },
        { id: 'recommended', visible: true, order: 4 },
        { id: 'trending', visible: true, order: 5 }
      ];
    }
  };

  // Load reviewer comments
  const loadReviewerComments = async (): Promise<ReviewerComment[]> => {
    try {
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (data || []).map(comment => ({
        id: comment.id,
        reviewer_name: comment.reviewer_name,
        comment: comment.comment,
        created_at: comment.created_at,
        reviewer_avatar: comment.reviewer_avatar
      }));
    } catch (error) {
      console.error('Error loading reviewer comments:', error);
      return [];
    }
  };

  // Load featured issue
  const loadFeaturedIssue = async (): Promise<Issue | null> => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error loading featured issue:', error);
      return null;
    }
  };

  // Define data loaders with real implementations
  const dataLoaders: DataLoader[] = [
    {
      key: 'issues',
      loader: loadIssues,
      critical: true,
    },
    {
      key: 'sectionVisibility',
      loader: loadSectionVisibility,
      critical: false,
    },
    {
      key: 'reviewerComments',
      loader: loadReviewerComments,
      critical: false,
    },
    {
      key: 'featuredIssue',
      loader: loadFeaturedIssue,
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
            (newState as any)[loader.key] = [
              { id: 'reviewer', visible: true, order: 0 },
              { id: 'featured', visible: true, order: 1 },
              { id: 'upcoming', visible: true, order: 2 },
              { id: 'recent', visible: true, order: 3 },
              { id: 'recommended', visible: true, order: 4 },
              { id: 'trending', visible: true, order: 5 }
            ];
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
