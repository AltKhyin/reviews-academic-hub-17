
// ABOUTME: Materialized views optimization for high-frequency data access
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { useCallback, useEffect } from 'react';

interface MaterializedViewHealth {
  view_name: string;
  size: string;
  last_refresh: string;
  is_stale: boolean;
}

// Hook to create and manage materialized views
export const useMaterializedViewsOptimization = () => {
  // Create materialized views on first use
  const initializeMaterializedViews = useCallback(async () => {
    try {
      // Archive performance view (30s refresh cycle)
      await supabase.rpc('create_materialized_view_if_not_exists', {
        view_name: 'mv_published_issues_archive',
        view_definition: `
          SELECT 
            id, title, cover_image_url, specialty, authors, year, 
            published_at, score, description, featured, created_at
          FROM issues 
          WHERE published = true
          ORDER BY created_at DESC
        `
      });

      // Community stats view (1min refresh cycle)
      await supabase.rpc('create_materialized_view_if_not_exists', {
        view_name: 'mv_community_stats',
        view_definition: `
          SELECT 
            (SELECT COUNT(*) FROM profiles) as total_users,
            (SELECT COUNT(*) FROM posts WHERE published = true) as total_posts,
            (SELECT COUNT(*) FROM comments) as total_comments,
            (SELECT COUNT(*) FROM issues WHERE published = true) as total_issues,
            NOW() as last_updated
        `
      });

      console.log('Materialized views initialized successfully');
    } catch (error) {
      console.warn('Materialized views initialization failed:', error);
    }
  }, []);

  // Monitor materialized view health
  const { data: viewHealth } = useOptimizedQuery(
    ['materialized-views-health'],
    async (): Promise<MaterializedViewHealth[]> => {
      const { data, error } = await supabase.rpc('get_materialized_view_health');
      
      if (error) {
        console.warn('Unable to fetch materialized view health:', error);
        return [];
      }

      return data || [];
    },
    {
      ...queryConfigs.performance,
      refetchInterval: 5 * 60 * 1000, // Check health every 5 minutes
    }
  );

  // Automatic refresh strategy
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        // Refresh materialized views concurrently
        await supabase.rpc('refresh_materialized_views');
        console.log('Materialized views refreshed');
      } catch (error) {
        console.warn('Materialized view refresh failed:', error);
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, []);

  // Initialize views on hook mount
  useEffect(() => {
    initializeMaterializedViews();
  }, [initializeMaterializedViews]);

  return {
    viewHealth,
    initializeMaterializedViews,
  };
};

// Hook for using materialized view data
export const useMaterializedViewData = (viewName: string) => {
  return useOptimizedQuery(
    ['materialized-view', viewName],
    async () => {
      const { data, error } = await supabase
        .from(viewName)
        .select('*');

      if (error) throw error;
      return data;
    },
    {
      ...queryConfigs.static,
      staleTime: 30 * 1000, // 30 seconds since views are refreshed every minute
    }
  );
};
