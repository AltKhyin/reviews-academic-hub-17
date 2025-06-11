
// ABOUTME: Section visibility management hook with enhanced error handling and database debugging
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';

export interface SectionConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export type Section = SectionConfig;

const SECTION_ID_MAPPING: Record<string, string> = {
  'reviewer_notes': 'reviews',
  'featured_carousel': 'featured', 
  'recent_issues': 'recent',
  'popular_issues': 'trending',
  'recommended_issues': 'recommended',
  'upcoming_releases': 'upcoming'
};

const DASHBOARD_TO_DB_MAPPING: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_ID_MAPPING).map(([db, dash]) => [dash, db])
);

const defaultSections: SectionConfig[] = [
  { id: 'reviews', title: 'Reviewer Comments', visible: true, order: 0 },
  { id: 'featured', title: 'Featured Content', visible: true, order: 1 },
  { id: 'recent', title: 'Recent Issues', visible: true, order: 2 },
  { id: 'recommended', title: 'Recommended', visible: true, order: 3 },
  { id: 'trending', title: 'Trending', visible: true, order: 4 },
  { id: 'upcoming', title: 'Upcoming Releases', visible: true, order: 5 },
];

const isSectionConfigArray = (data: unknown): data is SectionConfig[] => {
  return Array.isArray(data) && data.every(item => 
    item && 
    typeof item === 'object' && 
    'id' in item && 
    'title' in item && 
    'visible' in item && 
    'order' in item
  );
};

const updateSiteMetaWithRetry = async (key: string, value: any, maxRetries = 3) => {
  console.log(`[useSectionVisibility] Attempting to update site_meta key: ${key}`, value);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // First check if the key exists
      const { data: existing, error: checkError } = await supabase
        .from('site_meta')
        .select('id, key')
        .eq('key', key)
        .maybeSingle();
      
      if (checkError) {
        console.error(`[useSectionVisibility] Error checking existing record (attempt ${attempt + 1}):`, checkError);
        if (attempt === maxRetries - 1) throw checkError;
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        continue;
      }

      let result;
      if (existing) {
        // Update existing record
        console.log(`[useSectionVisibility] Updating existing record with id: ${existing.id}`);
        result = await supabase
          .from('site_meta')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)
          .select();
      } else {
        // Insert new record
        console.log(`[useSectionVisibility] Inserting new record for key: ${key}`);
        result = await supabase
          .from('site_meta')
          .insert({ key, value })
          .select();
      }

      if (result.error) {
        console.error(`[useSectionVisibility] Database operation failed (attempt ${attempt + 1}):`, result.error);
        if (result.error.message.includes('duplicate key value') || result.error.message.includes('unique constraint')) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }
        throw result.error;
      }

      console.log(`[useSectionVisibility] Successfully updated site_meta:`, result.data);
      return { success: true, data: result.data };
    } catch (error) {
      console.error(`[useSectionVisibility] Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
};

export const useSectionVisibility = () => {
  const [localSections, setLocalSections] = useState<SectionConfig[]>(defaultSections);

  const { 
    data: sections, 
    isLoading,
    error,
    refetch
  } = useOptimizedQuery(
    queryKeys.homeSettings(),
    async (): Promise<SectionConfig[]> => {
      try {
        console.log('[useSectionVisibility] Fetching home settings from database...');
        const { data, error } = await supabase.rpc('get_home_settings');
        
        if (error) {
          console.error('[useSectionVisibility] Database error:', error);
          throw error;
        }
        
        console.log('[useSectionVisibility] Raw database response:', data);
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const settings = data as Record<string, any>;
          if (settings.sections && typeof settings.sections === 'object') {
            const mappedSections = Object.entries(settings.sections).map(([dbId, config]: [string, any]) => {
              const dashboardId = SECTION_ID_MAPPING[dbId] || dbId;
              return {
                id: dashboardId,
                title: config?.title || dashboardId.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                visible: config?.visible !== false,
                order: config?.order || 0,
              };
            });
            
            console.log('[useSectionVisibility] Mapped sections from DB:', mappedSections);
            return mappedSections;
          }
        }
        
        console.log('[useSectionVisibility] Using default sections (no valid data found)');
        return defaultSections;
      } catch (error) {
        console.error('[useSectionVisibility] Failed to load section visibility settings:', error);
        return defaultSections;
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 15 * 60 * 1000,
      retry: false,
    }
  );

  const safeSections = isSectionConfigArray(sections) ? sections : defaultSections;

  const getVisibleSections = useCallback(() => {
    const visibleSections = safeSections.filter(section => section.visible).sort((a, b) => a.order - b.order);
    console.log('[useSectionVisibility] getVisibleSections returning:', visibleSections.map(s => `${s.id} (order: ${s.order})`));
    return visibleSections;
  }, [safeSections]);

  const getSectionById = useCallback((id: string) => {
    return safeSections.find(section => section.id === id);
  }, [safeSections]);

  const getAllSections = useCallback(() => {
    return [...safeSections].sort((a, b) => a.order - b.order);
  }, [safeSections]);

  const toggleSectionVisibility = useCallback(async (sectionId: string) => {
    const section = getSectionById(sectionId);
    if (!section) {
      console.error(`[useSectionVisibility] Section not found: ${sectionId}`);
      return;
    }

    console.log(`[useSectionVisibility] Toggling visibility for section: ${sectionId} from ${section.visible} to ${!section.visible}`);

    setLocalSections(prev => 
      prev.map(s => 
        s.id === sectionId 
          ? { ...s, visible: !s.visible }
          : s
      )
    );

    try {
      const { data: currentSettings, error: fetchError } = await supabase.rpc('get_home_settings');
      
      if (fetchError) {
        console.error('[useSectionVisibility] Error fetching current settings:', fetchError);
        throw fetchError;
      }

      console.log('[useSectionVisibility] Current settings from DB:', currentSettings);
      
      const settings = (currentSettings && typeof currentSettings === 'object') ? currentSettings as Record<string, any> : {};
      const updatedSections = { ...settings.sections };
      
      const dbSectionId = DASHBOARD_TO_DB_MAPPING[sectionId] || sectionId;
      console.log(`[useSectionVisibility] Mapping ${sectionId} to database ID: ${dbSectionId}`);
      
      if (updatedSections[dbSectionId]) {
        updatedSections[dbSectionId].visible = !section.visible;
      } else {
        updatedSections[dbSectionId] = { visible: !section.visible, order: section.order };
      }

      const finalSettings = { ...settings, sections: updatedSections };
      console.log('[useSectionVisibility] Final settings to save:', finalSettings);

      await updateSiteMetaWithRetry('home_settings', finalSettings);
      
      // Refetch to ensure UI reflects database state
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error) {
      console.error('[useSectionVisibility] Failed to toggle section visibility:', error);
      setLocalSections(prev => 
        prev.map(s => 
          s.id === sectionId 
            ? { ...s, visible: section.visible }
            : s
        )
      );
    }
  }, [getSectionById, refetch]);

  const reorderSections = useCallback(async (newOrder: string[]) => {
    console.log('[useSectionVisibility] Reordering sections:', newOrder);
    
    try {
      const { data: currentSettings, error: fetchError } = await supabase.rpc('get_home_settings');
      
      if (fetchError) {
        console.error('[useSectionVisibility] Error fetching current settings for reorder:', fetchError);
        throw fetchError;
      }
      
      const settings = (currentSettings && typeof currentSettings === 'object') ? currentSettings as Record<string, any> : {};
      const updatedSections = { ...settings.sections };
      
      newOrder.forEach((sectionId, index) => {
        const dbSectionId = DASHBOARD_TO_DB_MAPPING[sectionId] || sectionId;
        
        if (updatedSections[dbSectionId]) {
          updatedSections[dbSectionId].order = index;
        } else {
          updatedSections[dbSectionId] = { visible: true, order: index };
        }
      });

      const finalSettings = { ...settings, sections: updatedSections };
      console.log('[useSectionVisibility] Final reorder settings to save:', finalSettings);

      await updateSiteMetaWithRetry('home_settings', finalSettings);
      
      // Refetch to ensure UI reflects database state
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error) {
      console.error('[useSectionVisibility] Failed to reorder sections:', error);
    }
  }, [refetch]);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<SectionConfig>) => {
    console.log('[useSectionVisibility] Updating section:', sectionId, updates);
    
    try {
      const { data: currentSettings, error: fetchError } = await supabase.rpc('get_home_settings');
      
      if (fetchError) {
        console.error('[useSectionVisibility] Error fetching current settings for update:', fetchError);
        throw fetchError;
      }
      
      const settings = (currentSettings && typeof currentSettings === 'object') ? currentSettings as Record<string, any> : {};
      const updatedSections = { ...settings.sections };
      
      const dbSectionId = DASHBOARD_TO_DB_MAPPING[sectionId] || sectionId;
      
      updatedSections[dbSectionId] = { ...updatedSections[dbSectionId], ...updates };

      const finalSettings = { ...settings, sections: updatedSections };
      console.log('[useSectionVisibility] Final update settings to save:', finalSettings);

      await updateSiteMetaWithRetry('home_settings', finalSettings);
      
      // Refetch to ensure UI reflects database state
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error) {
      console.error('[useSectionVisibility] Failed to update section:', error);
    }
  }, [refetch]);

  const resetToDefaults = useCallback(async () => {
    console.log('[useSectionVisibility] Resetting to defaults');
    
    try {
      const defaultSettings = {
        sections: Object.fromEntries(
          defaultSections.map(section => {
            const dbSectionId = DASHBOARD_TO_DB_MAPPING[section.id] || section.id;
            return [dbSectionId, { visible: section.visible, order: section.order }];
          })
        )
      };

      console.log('[useSectionVisibility] Default settings to save:', defaultSettings);

      await updateSiteMetaWithRetry('home_settings', defaultSettings);
      
      setLocalSections(defaultSections);
      
      // Refetch to ensure UI reflects database state
      setTimeout(() => {
        refetch();
      }, 500);
      
    } catch (error) {
      console.error('[useSectionVisibility] Failed to reset to defaults:', error);
    }
  }, [refetch]);

  return {
    sections: safeSections,
    isLoading,
    error,
    getVisibleSections,
    getSectionById,
    getAllSections,
    toggleSectionVisibility,
    reorderSections,
    updateSection,
    resetToDefaults,
  };
};
