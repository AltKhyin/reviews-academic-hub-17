
// ABOUTME: Materialized views optimization for enhanced database performance
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaterializedViewHealth {
  view_name: string;
  size: string;
  last_refresh: string;
  is_stale: boolean;
}

interface ViewOptimizationStats {
  totalViews: number;
  staleViews: number;
  totalSize: string;
  lastRefresh: Date | null;
  refreshInProgress: boolean;
}

export const useMaterializedViewsOptimization = () => {
  const [viewHealth, setViewHealth] = useState<MaterializedViewHealth[]>([]);
  const [stats, setStats] = useState<ViewOptimizationStats>({
    totalViews: 0,
    staleViews: 0,
    totalSize: '0 B',
    lastRefresh: null,
    refreshInProgress: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get materialized view health status
  const getViewHealth = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_materialized_view_health');
      
      if (error) {
        console.error('Error fetching view health:', error);
        return [];
      }

      // Type guard and transformation
      if (Array.isArray(data)) {
        const healthData = data as MaterializedViewHealth[];
        setViewHealth(healthData);
        
        // Calculate stats
        const staleCount = healthData.filter((view: MaterializedViewHealth) => view.is_stale).length;
        const lastRefreshDates = healthData
          .map((view: MaterializedViewHealth) => new Date(view.last_refresh))
          .filter(date => !isNaN(date.getTime()));
        
        setStats({
          totalViews: healthData.length,
          staleViews: staleCount,
          totalSize: healthData.reduce((acc, view) => acc + ' + ' + view.size, '').slice(3) || '0 B',
          lastRefresh: lastRefreshDates.length > 0 ? new Date(Math.max(...lastRefreshDates.map(d => d.getTime()))) : null,
          refreshInProgress: false,
        });
        
        return healthData;
      }
      
      return [];
    } catch (error) {
      console.error('Error in getViewHealth:', error);
      return [];
    }
  }, []);

  // Create materialized views if they don't exist
  const createViewsIfNeeded = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.rpc('create_materialized_view_if_not_exists');
      
      if (error) {
        console.error('Error creating materialized views:', error);
        throw error;
      }
      
      console.log('✅ Materialized views created/verified successfully');
      await getViewHealth();
    } catch (error) {
      console.error('Failed to create materialized views:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getViewHealth]);

  // Refresh all materialized views
  const refreshViews = useCallback(async () => {
    try {
      setStats(prev => ({ ...prev, refreshInProgress: true }));
      
      const { error } = await supabase.rpc('refresh_materialized_views');
      
      if (error) {
        console.error('Error refreshing materialized views:', error);
        throw error;
      }
      
      console.log('✅ Materialized views refreshed successfully');
      
      // Wait a moment then fetch updated health
      setTimeout(() => {
        getViewHealth();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to refresh materialized views:', error);
    } finally {
      setStats(prev => ({ ...prev, refreshInProgress: false }));
    }
  }, [getViewHealth]);

  // Auto-refresh stale views
  const autoRefreshIfStale = useCallback(async () => {
    const health = await getViewHealth();
    const hasStaleViews = health.some((view: MaterializedViewHealth) => view.is_stale);
    
    if (hasStaleViews) {
      console.log('🔄 Auto-refreshing stale materialized views');
      await refreshViews();
    }
  }, [getViewHealth, refreshViews]);

  // Initialize views and check health on mount
  useEffect(() => {
    const initializeViews = async () => {
      await createViewsIfNeeded();
      await getViewHealth();
    };
    
    initializeViews();
  }, [createViewsIfNeeded, getViewHealth]);

  // Auto-refresh stale views periodically
  useEffect(() => {
    const interval = setInterval(autoRefreshIfStale, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [autoRefreshIfStale]);

  return {
    viewHealth,
    stats,
    isLoading,
    refreshViews,
    createViewsIfNeeded,
    getViewHealth,
    autoRefreshIfStale,
  };
};
