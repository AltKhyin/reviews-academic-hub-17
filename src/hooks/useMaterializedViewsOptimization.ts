
// ABOUTME: Materialized views management and optimization system
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface MaterializedView {
  view_name: string;
  size: string;
  last_refresh: string;
  is_stale: boolean;
}

interface ViewRefreshResult {
  view_name: string;
  success: boolean;
  duration: number;
  error?: string;
}

export const useMaterializedViewsOptimization = () => {
  const [refreshing, setRefreshing] = useState<string[]>([]);
  const [lastRefreshResults, setLastRefreshResults] = useState<ViewRefreshResult[]>([]);

  // Query materialized view health
  const { data: viewHealth = [], isLoading } = useOptimizedQuery(
    ['materialized-view-health'],
    async (): Promise<MaterializedView[]> => {
      const { data, error } = await supabase.rpc('get_materialized_view_health');
      
      if (error) {
        console.error('Error fetching materialized view health:', error);
        throw error;
      }
      
      return data || [];
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Create materialized views if they don't exist
  const initializeMaterializedViews = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('create_materialized_view_if_not_exists');
      
      if (error) {
        console.error('Error initializing materialized views:', error);
        throw error;
      }
      
      console.log('✅ Materialized views initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize materialized views:', error);
      return false;
    }
  }, []);

  // Refresh specific materialized view
  const refreshView = useCallback(async (viewName: string): Promise<ViewRefreshResult> => {
    const startTime = performance.now();
    setRefreshing(prev => [...prev, viewName]);
    
    try {
      // For now, use the general refresh function since we can't refresh individual views easily
      const { error } = await supabase.rpc('refresh_materialized_views');
      
      if (error) throw error;
      
      const duration = performance.now() - startTime;
      const result: ViewRefreshResult = {
        view_name: viewName,
        success: true,
        duration,
      };
      
      setLastRefreshResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      console.log(`✅ Refreshed materialized view ${viewName} in ${duration.toFixed(0)}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const result: ViewRefreshResult = {
        view_name: viewName,
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      setLastRefreshResults(prev => [result, ...prev.slice(0, 9)]);
      console.error(`❌ Failed to refresh materialized view ${viewName}:`, error);
      
      return result;
    } finally {
      setRefreshing(prev => prev.filter(name => name !== viewName));
    }
  }, []);

  // Refresh all stale views
  const refreshStaleViews = useCallback(async (): Promise<ViewRefreshResult[]> => {
    const staleViews = viewHealth.filter(view => view.is_stale);
    
    if (staleViews.length === 0) {
      console.log('✅ No stale materialized views found');
      return [];
    }
    
    console.log(`🔄 Refreshing ${staleViews.length} stale materialized views`);
    
    const results = await Promise.all(
      staleViews.map(view => refreshView(view.view_name))
    );
    
    return results;
  }, [viewHealth, refreshView]);

  // Auto-refresh stale views on mount
  useEffect(() => {
    if (viewHealth.length > 0) {
      const staleCount = viewHealth.filter(view => view.is_stale).length;
      if (staleCount > 0) {
        console.log(`🔄 Found ${staleCount} stale materialized views, auto-refreshing...`);
        refreshStaleViews();
      }
    }
  }, [viewHealth, refreshStaleViews]);

  return {
    viewHealth,
    isLoading,
    refreshing,
    lastRefreshResults,
    initializeMaterializedViews,
    refreshView,
    refreshStaleViews,
  };
};
