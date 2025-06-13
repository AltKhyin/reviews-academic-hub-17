
// ABOUTME: Standardized data access hooks replacing direct component API calls
// Provides coordinated data loading through RequestCoordinator

import { useState, useEffect, useCallback } from 'react';
import { requestCoordinator, PageData } from '@/core/RequestCoordinator';
import { useAuth } from '@/contexts/AuthContext';

interface PageDataState {
  data: PageData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UserContextState {
  bookmarks: Set<string>;
  reactions: Map<string, string>;
  permissions: any;
  loading: boolean;
  isBookmarked: (issueId: string) => boolean;
  hasReaction: (issueId: string, type: string) => boolean;
  toggleBookmark: (issueId: string) => Promise<void>;
  toggleReaction: (issueId: string, type: string) => Promise<void>;
}

interface ContentState {
  issues: any[];
  featuredIssue: any;
  metadata: any;
  loading: boolean;
}

// Main coordinated page data hook
export const usePageData = (route?: string): PageDataState => {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentRoute = route || window.location.pathname;
      console.log('🔄 usePageData: Loading data for route:', currentRoute);
      
      const pageData = await requestCoordinator.loadPageData(currentRoute, user?.id);
      setData(pageData);
      
      console.log('✅ usePageData: Data loaded successfully');
    } catch (err) {
      console.error('❌ usePageData: Error loading data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [route, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    // Invalidate cache and reload
    requestCoordinator.invalidateCache();
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Coordinated user context hook
export const useUserContext = (): UserContextState => {
  const { data, loading } = usePageData();
  const { user } = useAuth();
  
  const bookmarks = new Set(
    data?.userData?.bookmarks?.map(b => b.issue_id) || []
  );
  
  const reactions = new Map(
    data?.userData?.reactions?.map(r => [r.issue_id, r.reaction_type]) || []
  );

  const isBookmarked = useCallback((issueId: string) => {
    return bookmarks.has(issueId);
  }, [bookmarks]);

  const hasReaction = useCallback((issueId: string, type: string) => {
    return reactions.get(issueId) === type;
  }, [reactions]);

  const toggleBookmark = useCallback(async (issueId: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    if (isBookmarked(issueId)) {
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('issue_id', issueId);
    } else {
      await supabase
        .from('user_bookmarks')
        .insert({ user_id: user.id, issue_id: issueId });
    }
    
    // Invalidate cache to refresh data
    requestCoordinator.invalidateCache();
  }, [user?.id, isBookmarked]);

  const toggleReaction = useCallback(async (issueId: string, type: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    if (hasReaction(issueId, type)) {
      await supabase
        .from('user_article_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('issue_id', issueId)
        .eq('reaction_type', type);
    } else {
      await supabase
        .from('user_article_reactions')
        .upsert({ user_id: user.id, issue_id: issueId, reaction_type: type });
    }
    
    // Invalidate cache to refresh data
    requestCoordinator.invalidateCache();
  }, [user?.id, hasReaction]);

  return {
    bookmarks,
    reactions,
    permissions: data?.userData?.permissions,
    loading,
    isBookmarked,
    hasReaction,
    toggleBookmark,
    toggleReaction
  };
};

// Coordinated content data hook
export const useBulkContent = (): ContentState => {
  const { data, loading } = usePageData();

  return {
    issues: data?.contentData?.issues || [],
    featuredIssue: data?.contentData?.featuredIssue,
    metadata: data?.contentData?.metadata,
    loading
  };
};

// Configuration data hook
export const useConfigData = () => {
  const { data, loading } = usePageData();

  return {
    sectionVisibility: data?.configData?.sectionVisibility || [],
    settings: data?.configData?.settings,
    loading
  };
};

// Performance metrics for the standardized system
export const useStandardizedDataMetrics = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const performanceMetrics = requestCoordinator.getPerformanceMetrics();
      setMetrics(performanceMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// Main export object for convenient access
export const useStandardizedData = {
  usePageData,
  useUserContext,
  useBulkContent,
  useConfigData,
  useStandardizedDataMetrics
};
