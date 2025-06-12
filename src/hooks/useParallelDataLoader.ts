
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

// Helper function to convert database issue to Issue type
const convertDbIssueToIssue = (dbIssue: any): Issue => {
  return {
    ...dbIssue,
    backend_tags: typeof dbIssue.backend_tags === 'string' 
      ? dbIssue.backend_tags 
      : dbIssue.backend_tags 
        ? JSON.stringify(dbIssue.backend_tags) 
        : null,
  };
};

// Default sections configuration
const DEFAULT_SECTIONS: SectionVisibilityConfig[] = [
  { id: 'reviewer', visible: true, order: 0 },
  { id: 'featured', visible: true, order: 1 },
  { id: 'upcoming', visible: true, order: 2 },
  { id: 'recent', visible: true, order: 3 },
  { id: 'recommended', visible: true, order: 4 },
  { id: 'trending', visible: true, order: 5 }
];

export const useParallelDataLoader = (): ParallelDataState => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [state, setState] = useState<ParallelDataState>({
    issues: [],
    sectionVisibility: DEFAULT_SECTIONS,
    reviewerComments: [],
    featuredIssue: null,
    isLoading: true,
    errors: {},
    retryFailed: () => {},
  });

  // Load issues from database
  const loadIssues = async (): Promise<Issue[]> => {
    try {
      console.log('useParallelDataLoader: Loading issues...');
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      const issues = (data || []).map(convertDbIssueToIssue);
      console.log('useParallelDataLoader: Loaded', issues.length, 'issues');
      return issues;
    } catch (error) {
      console.error('Error loading issues:', error);
      return [];
    }
  };

  // Load section visibility settings
  const loadSectionVisibility = async (): Promise<SectionVisibilityConfig[]> => {
    try {
      console.log('useParallelDataLoader: Loading section visibility...');
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
        const sections = Object.entries(sectionsConfig).map(([id, config]: [string, any]) => ({
          id,
          visible: config?.visible ?? true,
          order: config?.order ?? 0
        }));
        
        console.log('useParallelDataLoader: Loaded section visibility', sections);
        return sections;
      }

      console.log('useParallelDataLoader: Using default section visibility');
      return DEFAULT_SECTIONS;
    } catch (error) {
      console.error('Error loading section visibility:', error);
      return DEFAULT_SECTIONS;
    }
  };

  // Load reviewer comments
  const loadReviewerComments = async (): Promise<ReviewerComment[]> => {
    try {
      console.log('useParallelDataLoader: Loading reviewer comments...');
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const comments = (data || []).map(comment => ({
        id: comment.id,
        reviewer_name: comment.reviewer_name,
        comment: comment.comment,
        created_at: comment.created_at,
        reviewer_avatar: comment.reviewer_avatar
      }));
      
      console.log('useParallelDataLoader: Loaded', comments.length, 'reviewer comments');
      return comments;
    } catch (error) {
      console.error('Error loading reviewer comments:', error);
      return [];
    }
  };

  // Load featured issue
  const loadFeaturedIssue = async (): Promise<Issue | null> => {
    try {
      console.log('useParallelDataLoader: Loading featured issue...');
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      const featuredIssue = data ? convertDbIssueToIssue(data) : null;
      console.log('useParallelDataLoader: Featured issue:', featuredIssue?.id || 'none');
      return featuredIssue;
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
    console.log('useParallelDataLoader: Starting data load...');
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
        console.log(`useParallelDataLoader: Successfully loaded ${loader.key}`);
      } else {
        errors[loader.key] = result.reason;
        console.error(`useParallelDataLoader: Failed to load ${loader.key}:`, result.reason);
        
        // Set defaults for failed loads
        switch (loader.key) {
          case 'issues':
            (newState as any)[loader.key] = [];
            break;
          case 'sectionVisibility':
            (newState as any)[loader.key] = DEFAULT_SECTIONS;
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
    
    console.log('useParallelDataLoader: Data load complete. State:', {
      issuesCount: (newState as any).issues?.length || 0,
      sectionsCount: (newState as any).sectionVisibility?.length || 0,
      commentsCount: (newState as any).reviewerComments?.length || 0,
      featuredIssue: (newState as any).featuredIssue?.id || 'none',
      errorsCount: Object.keys(errors).length
    });
    
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Retry failed data loads
  const retryFailed = useCallback(() => {
    console.log('useParallelDataLoader: Retrying failed loads...');
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
