
// ABOUTME: Materialized views optimization for complex queries
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaterializedViewHealth {
  view_name: string;
  size: string;
  last_refresh: string;
  is_stale: boolean;
}

export const useMaterializedViewsOptimization = () => {
  const [viewHealth, setViewHealth] = useState<MaterializedViewHealth[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check materialized view health
  const checkViewHealth = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_materialized_view_health');
      
      if (!error && data) {
        setViewHealth(data);
      }
    } catch (error) {
      console.warn('Failed to check materialized view health:', error);
    }
  }, []);

  // Refresh materialized views
  const refreshViews = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // First ensure views exist
      await supabase.rpc('create_materialized_view_if_not_exists');
      
      // Then refresh them
      await supabase.rpc('refresh_materialized_views');
      
      // Check health after refresh
      setTimeout(checkViewHealth, 1000);
    } catch (error) {
      console.error('Failed to refresh materialized views:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [checkViewHealth]);

  // Auto-refresh stale views
  const autoRefreshStaleViews = useCallback(async () => {
    const staleViews = viewHealth.filter(view => view.is_stale);
    
    if (staleViews.length > 0) {
      console.log(`🔄 Auto-refreshing ${staleViews.length} stale materialized views`);
      await refreshViews();
    }
  }, [viewHealth, refreshViews]);

  // Initialize and check health periodically
  useEffect(() => {
    checkViewHealth();
    
    // Check every 5 minutes
    const healthInterval = setInterval(checkViewHealth, 5 * 60 * 1000);
    
    // Auto-refresh stale views every 10 minutes
    const refreshInterval = setInterval(autoRefreshStaleViews, 10 * 60 * 1000);
    
    return () => {
      clearInterval(healthInterval);
      clearInterval(refreshInterval);
    };
  }, [checkViewHealth, autoRefreshStaleViews]);

  return {
    viewHealth,
    isRefreshing,
    refreshViews,
    checkViewHealth,
  };
};
