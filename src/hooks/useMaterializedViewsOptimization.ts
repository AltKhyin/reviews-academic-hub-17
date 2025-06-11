
// ABOUTME: Materialized views optimization and health monitoring
import { useOptimizedQuery, queryKeys } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface ViewHealth {
  view_name: string;
  size: string;
  last_refresh: string;
  is_stale: boolean;
}

export const useMaterializedViewsOptimization = () => {
  const { data: viewHealth = [] } = useOptimizedQuery<ViewHealth[]>(
    ['materialized-view-health'],
    async (): Promise<ViewHealth[]> => {
      try {
        const { data, error } = await supabase.rpc('get_materialized_view_health');
        if (error) throw error;
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn('Failed to fetch materialized view health:', error);
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 10 * 60 * 1000, // 10 minutes
    }
  );

  const refreshViews = async () => {
    try {
      const { error } = await supabase.rpc('refresh_materialized_views');
      if (error) throw error;
      console.log('✅ Materialized views refreshed');
    } catch (error) {
      console.error('Failed to refresh materialized views:', error);
    }
  };

  return {
    viewHealth: Array.isArray(viewHealth) ? viewHealth : [],
    refreshViews,
  };
};
