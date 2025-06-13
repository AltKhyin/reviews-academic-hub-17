
// ABOUTME: Migrated sidebar data system to use unified architecture
import { useUnifiedQuery } from './useUnifiedQuery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DataAccessLayer } from '@/core/DataAccessLayer';

export const useOptimizedSidebarData = () => {
  const { user } = useAuth();
  const dataLayer = DataAccessLayer.getInstance();

  // Use unified query system for stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useUnifiedQuery(
    ['sidebar-stats'],
    async () => {
      return await dataLayer.executeOperation({
        type: 'query',
        resource: 'posts',
        parameters: { 
          action: 'count',
          filters: { published: true }
        }
      });
    },
    { priority: 'normal' }
  );

  // Use unified query system for reviewer comments
  const { data: reviewerComments, isLoading: commentsLoading, error: commentsError } = useUnifiedQuery(
    ['sidebar-reviewer-comments'],
    async () => {
      return await dataLayer.executeOperation({
        type: 'query',
        resource: 'reviewer_comments',
        parameters: { 
          limit: 5,
          order: { column: 'created_at', ascending: false }
        }
      });
    },
    { priority: 'background' }
  );

  // Use unified query system for top threads
  const { data: topThreads, isLoading: threadsLoading, error: threadsError } = useUnifiedQuery(
    ['sidebar-top-threads'],
    async () => {
      return await dataLayer.executeOperation({
        type: 'query',
        resource: 'posts',
        parameters: { 
          limit: 5,
          order: { column: 'score', ascending: false },
          filters: { published: true }
        }
      });
    },
    { priority: 'background' }
  );

  return {
    stats: {
      data: stats?.data,
      isLoading: statsLoading,
      error: statsError
    },
    reviewerComments: {
      data: reviewerComments?.data,
      isLoading: commentsLoading,
      error: commentsError
    },
    topThreads: {
      data: topThreads?.data,
      isLoading: threadsLoading,
      error: threadsError
    },
    isLoading: statsLoading || commentsLoading || threadsLoading,
    hasError: !!(statsError || commentsError || threadsError)
  };
};
