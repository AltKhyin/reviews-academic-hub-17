
// ABOUTME: Complete materialized views optimization with real RPC functions
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery, queryConfigs } from './useOptimizedQuery';
import { useCallback, useEffect } from 'react';

interface MaterializedViewHealth {
  view_name: string;
  size: string;
  last_refresh: string;
  is_stale: boolean;
}

// Hook to manage materialized views
export const useMaterializedViewsOptimization = () => {
  const initializeMaterializedViews = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('create_materialized_view_if_not_exists');
      if (error) throw error;
      console.log('✅ Materialized views initialized successfully');
    } catch (error) {
      console.error('❌ Materialized views initialization failed:', error);
    }
  }, []);

  // Monitor materialized view health
  const { data: viewHealth } = useOptimizedQuery(
    ['materialized-views-health'],
    async (): Promise<MaterializedViewHealth[]> => {
      const { data, error } = await supabase.rpc('get_materialized_view_health');
      if (error) throw error;
      return data || [];
    },
    {
      ...queryConfigs.performance,
      refetchInterval: 5 * 60 * 1000, // Check health every 5 minutes
    }
  );

  // Refresh materialized views
  const refreshViews = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('refresh_materialized_views');
      if (error) throw error;
      console.log('✅ Materialized views refreshed successfully');
    } catch (error) {
      console.error('❌ Materialized view refresh failed:', error);
    }
  }, []);

  // Auto-refresh strategy every 2 minutes
  useEffect(() => {
    const refreshInterval = setInterval(refreshViews, 2 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [refreshViews]);

  // Initialize views on hook mount
  useEffect(() => {
    initializeMaterializedViews();
  }, [initializeMaterializedViews]);

  return {
    viewHealth: viewHealth || [],
    initializeMaterializedViews,
    refreshViews,
  };
};

// Hook for using materialized view data
export const useMaterializedViewData = (viewName: string) => {
  return useOptimizedQuery(
    ['materialized-view', viewName],
    async () => {
      // Query materialized views directly for faster access
      if (viewName === 'mv_published_issues_archive') {
        const { data, error } = await supabase
          .from('mv_published_issues_archive' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        return data;
      }
      
      if (viewName === 'mv_community_stats') {
        const { data, error } = await supabase
          .from('mv_community_stats' as any)
          .select('*')
          .single();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    {
      ...queryConfigs.static,
      staleTime: 30 * 1000, // 30 seconds since views are refreshed every 2 minutes
    }
  );
};
