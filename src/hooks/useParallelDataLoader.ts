
// ABOUTME: Enhanced parallel data loading system with comprehensive error recovery and standardized data formats
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
  title?: string;
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

// Default sections configuration that matches SECTION_REGISTRY with new optimized sections
const DEFAULT_SECTIONS: SectionVisibilityConfig[] = [
  { id: 'reviewer', visible: true, order: 0, title: 'Comentários dos Revisores' },
  { id: 'featured', visible: true, order: 1, title: 'Edição em Destaque' },
  { id: 'recent', visible: true, order: 2, title: 'Edições Recentes' },
  { id: 'upcoming', visible: true, order: 3, title: 'Próximas Edições' },
  { id: 'recommended', visible: true, order: 4, title: 'Recomendados para você' },
  { id: 'trending', visible: false, order: 5, title: 'Mais Acessados' }
];

// Helper to safely create section config from database object
const createSectionConfigFromObject = (sectionsObj: Record<string, any>): SectionVisibilityConfig[] => {
  const sectionKeys = ['reviewer', 'featured', 'recent', 'upcoming', 'recommended', 'trending'];
  
  return sectionKeys.map((key, defaultOrder) => {
    const sectionData = sectionsObj[key] || {};
    const defaultSection = DEFAULT_SECTIONS.find(s => s.id === key) || DEFAULT_SECTIONS[defaultOrder];
    
    return {
      id: key,
      visible: sectionData.visible ?? (defaultSection?.visible ?? true),
      order: sectionData.order ?? defaultOrder,
      title: defaultSection?.title || key
    };
  }).sort((a, b) => a.order - b.order);
};

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

  // Load issues from database with enhanced error handling
  const loadIssues = async (): Promise<Issue[]> => {
    try {
      console.log('useParallelDataLoader: Loading issues...');
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading issues:', error);
        throw error;
      }
      
      const issues = (data || []).map(convertDbIssueToIssue);
      console.log('useParallelDataLoader: Successfully loaded', issues.length, 'issues');
      return issues;
    } catch (error) {
      console.error('Failed to load issues:', error);
      return [];
    }
  };

  // Load section visibility settings with comprehensive format handling
  const loadSectionVisibility = async (): Promise<SectionVisibilityConfig[]> => {
    try {
      console.log('useParallelDataLoader: Loading section visibility...');
      
      // Try to get from home_settings first
      const { data: homeSettings, error: homeError } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'home_settings')
        .single();

      if (!homeError && homeSettings?.value) {
        const value = homeSettings.value as any;
        if (value.sections && typeof value.sections === 'object') {
          const sections = createSectionConfigFromObject(value.sections);
          console.log('useParallelDataLoader: Loaded sections from home_settings', sections);
          return sections;
        }
      }

      // Fallback to section_visibility key
      const { data: sectionData, error: sectionError } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'section_visibility')
        .single();

      if (!sectionError && sectionData?.value) {
        const value = sectionData.value as any;
        if (Array.isArray(value.sections)) {
          const sections = value.sections.map((section: any) => ({
            id: section.id,
            visible: section.visible ?? true,
            order: section.order ?? 0,
            title: section.title || DEFAULT_SECTIONS.find(s => s.id === section.id)?.title || section.id
          }));
          console.log('useParallelDataLoader: Loaded sections from section_visibility', sections);
          return sections;
        }
      }

      console.log('useParallelDataLoader: Using default section visibility with new optimized sections');
      return DEFAULT_SECTIONS;
    } catch (error) {
      console.error('Error loading section visibility:', error);
      return DEFAULT_SECTIONS;
    }
  };

  // Load reviewer comments with enhanced error handling
  const loadReviewerComments = async (): Promise<ReviewerComment[]> => {
    try {
      console.log('useParallelDataLoader: Loading reviewer comments...');
      const { data, error } = await supabase
        .from('reviewer_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading reviewer comments:', error);
        throw error;
      }
      
      const comments = (data || []).map(comment => ({
        id: comment.id,
        reviewer_name: comment.reviewer_name,
        comment: comment.comment,
        created_at: comment.created_at,
        reviewer_avatar: comment.reviewer_avatar
      }));
      
      console.log('useParallelDataLoader: Successfully loaded', comments.length, 'reviewer comments');
      return comments;
    } catch (error) {
      console.error('Failed to load reviewer comments:', error);
      return [];
    }
  };

  // Load featured issue with enhanced error handling
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
        .maybeSingle();

      if (error) {
        console.error('Error loading featured issue:', error);
        throw error;
      }
      
      const featuredIssue = data ? convertDbIssueToIssue(data) : null;
      console.log('useParallelDataLoader: Featured issue:', featuredIssue?.id || 'none');
      return featuredIssue;
    } catch (error) {
      console.error('Failed to load featured issue:', error);
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
      critical: false,
    },
  ];

  // Execute parallel data loading with comprehensive error handling
  const loadData = useCallback(async () => {
    console.log('useParallelDataLoader: Starting comprehensive data load...');
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
        console.log(`useParallelDataLoader: Successfully loaded ${loader.key}:`, 
          Array.isArray(result.value.data) ? `${result.value.data.length} items` : result.value.data ? 'data loaded' : 'no data');
      } else {
        errors[loader.key] = result.reason;
        console.error(`useParallelDataLoader: Failed to load ${loader.key}:`, result.reason);
        
        // Set safe defaults for failed loads
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
    
    console.log('useParallelDataLoader: Data load complete. Final state:', {
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
