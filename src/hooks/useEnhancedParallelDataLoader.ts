
// ABOUTME: Enhanced data loader that coordinates with UserInteractionContext to eliminate duplicates
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Issue } from '@/types/issue';
import { apiCallMonitor } from '@/middleware/ApiCallMiddleware';

interface EnhancedDataState {
  issues: Issue[];
  featuredIssue: Issue | null;
  sectionVisibility: any[];
  reviewerComments: any[];
  upcomingReleases: any[];
  contentSuggestions: any[];
  isLoading: boolean;
  errors: Record<string, any>;
}

export const useEnhancedParallelDataLoader = () => {
  const [state, setState] = useState<EnhancedDataState>({
    issues: [],
    featuredIssue: null,
    sectionVisibility: [],
    reviewerComments: [],
    upcomingReleases: [],
    contentSuggestions: [],
    isLoading: true,
    errors: {}
  });

  // PERFORMANCE FIX: Single coordinated data fetch
  const loadAllData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, errors: {} }));
    
    try {
      apiCallMonitor.trackCall('useParallelDataLoader', 'bulk-dashboard-data');
      
      // Single coordinated batch request - replaces 8+ individual calls
      const [
        issuesResponse,
        featuredResponse,
        sectionResponse,
        reviewerResponse,
        upcomingResponse,
        suggestionsResponse
      ] = await Promise.all([
        supabase
          .from('issues')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(50),
        
        supabase
          .from('issues')
          .select('*')
          .eq('published', true)
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
          
        supabase
          .from('site_meta')
          .select('value')
          .eq('key', 'home_settings')
          .single(),
          
        supabase
          .from('reviewer_comments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
          
        supabase
          .from('upcoming_releases')
          .select('*')
          .order('release_date', { ascending: true })
          .limit(1),
          
        supabase
          .from('content_suggestions')
          .select('*, user_votes(id, user_id, created_at)')
          .order('votes', { ascending: false })
      ]);

      // Process and validate responses
      const processedData = {
        issues: issuesResponse.data || [],
        featuredIssue: featuredResponse.data || null,
        sectionVisibility: sectionResponse.data?.value?.sections ? 
          Object.entries(sectionResponse.data.value.sections).map(([id, config]: [string, any]) => ({
            id,
            ...config
          })) : [],
        reviewerComments: reviewerResponse.data || [],
        upcomingReleases: upcomingResponse.data || [],
        contentSuggestions: suggestionsResponse.data || [],
        isLoading: false,
        errors: {
          issues: issuesResponse.error,
          featured: featuredResponse.error,
          sections: sectionResponse.error,
          reviewer: reviewerResponse.error,
          upcoming: upcomingResponse.error,
          suggestions: suggestionsResponse.error
        }
      };

      setState(processedData);
      
      console.log('Enhanced data loader: Loaded all dashboard data with 6 coordinated requests');
      
    } catch (error) {
      console.error('Enhanced data loader error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: { ...prev.errors, global: error }
      }));
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Memoized return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    ...state,
    retryFailed: loadAllData,
    // Extract issue IDs for UserInteractionContext
    allIssueIds: state.issues.map(issue => issue.id)
  }), [state, loadAllData]);

  return returnValue;
};
