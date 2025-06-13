
// ABOUTME: Homepage bridge hook connecting manager settings to dashboard display
// Provides unified data flow between homepage configuration and section rendering

import { useCallback, useEffect } from 'react';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';
import { useStandardizedData } from '@/hooks/useStandardizedData';
import { useOptimizedQuery, queryKeys } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

export const useHomepageBridge = () => {
  // Get section visibility configuration
  const { 
    sectionsConfig, 
    updateSectionVisibility, 
    updateSectionOrder,
    refetch: refetchConfig
  } = useSectionVisibility();

  // Get standardized homepage data
  const { 
    data: homepageData, 
    loading: dataLoading, 
    error: dataError,
    refetch: refetchData
  } = useStandardizedData.usePageData('/homepage');

  // Listen for configuration changes and invalidate data cache
  const handleConfigChange = useCallback(async (sectionId: string, updates: any) => {
    console.log('Homepage Bridge: Configuration change detected', { sectionId, updates });
    
    // Update section configuration
    await updateSectionVisibility(sectionId, updates);
    
    // Invalidate and refresh homepage data
    await refetchData();
    
    console.log('Homepage Bridge: Data refreshed after config change');
  }, [updateSectionVisibility, refetchData]);

  // Sync configuration with database
  const syncConfiguration = useCallback(async () => {
    if (!sectionsConfig) return;

    try {
      const { error } = await supabase
        .from('homepage_sections')
        .upsert(
          Object.entries(sectionsConfig).map(([sectionId, config]) => ({
            section_id: sectionId,
            visible: config.visible,
            order: config.order,
            title: config.title,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'section_id' }
        );

      if (error) {
        console.error('Homepage Bridge: Failed to sync configuration:', error);
      } else {
        console.log('Homepage Bridge: Configuration synced successfully');
      }
    } catch (error) {
      console.error('Homepage Bridge: Sync error:', error);
    }
  }, [sectionsConfig]);

  // Auto-sync configuration changes
  useEffect(() => {
    if (sectionsConfig) {
      const syncTimer = setTimeout(syncConfiguration, 1000);
      return () => clearTimeout(syncTimer);
    }
  }, [sectionsConfig, syncConfiguration]);

  return {
    // Configuration state
    sectionsConfig,
    isConfigLoading: !sectionsConfig,
    
    // Data state
    homepageData,
    isDataLoading: dataLoading,
    dataError,
    
    // Actions
    updateSectionConfig: handleConfigChange,
    updateSectionOrder,
    refreshAll: async () => {
      await Promise.all([refetchConfig(), refetchData()]);
    },
    
    // Computed state
    isReady: sectionsConfig && homepageData && !dataLoading,
  };
};
