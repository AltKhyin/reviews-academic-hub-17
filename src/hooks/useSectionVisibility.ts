
// ABOUTME: Section visibility management hook for dashboard layout configuration
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';

export interface SectionConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

// Export Section type alias for backward compatibility
export type Section = SectionConfig;

// Database to Dashboard section ID mapping
const SECTION_ID_MAPPING: Record<string, string> = {
  'reviewer_notes': 'reviews',
  'featured_carousel': 'featured', 
  'recent_issues': 'recent',
  'popular_issues': 'trending',
  'recommended_issues': 'recommended',
  'upcoming_releases': 'upcoming'
};

// Reverse mapping for updates
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

export const useSectionVisibility = () => {
  const [localSections, setLocalSections] = useState<SectionConfig[]>(defaultSections);

  const { 
    data: sections = defaultSections, 
    isLoading,
    error 
  } = useOptimizedQuery(
    queryKeys.homeSettings(),
    async (): Promise<SectionConfig[]> => {
      try {
        const { data, error } = await supabase.rpc('get_home_settings');
        
        if (error) throw error;
        
        // Parse the home settings and extract section configuration
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const settings = data as Record<string, any>;
          if (settings.sections && typeof settings.sections === 'object') {
            // Convert database section IDs to dashboard section IDs
            const mappedSections = Object.entries(settings.sections).map(([dbId, config]: [string, any]) => {
              const dashboardId = SECTION_ID_MAPPING[dbId] || dbId;
              return {
                id: dashboardId,
                title: config?.title || dashboardId.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                visible: config?.visible !== false,
                order: config?.order || 0,
              };
            });
            
            console.log('useSectionVisibility: Mapped sections from DB:', mappedSections);
            return mappedSections;
          }
        }
        
        console.log('useSectionVisibility: Using default sections');
        return defaultSections;
      } catch (error) {
        console.warn('Failed to load section visibility settings:', error);
        return defaultSections;
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 15 * 60 * 1000, // 15 minutes for section config
    }
  );

  const getVisibleSections = useCallback(() => {
    const visibleSections = sections.filter(section => section.visible).sort((a, b) => a.order - b.order);
    console.log('useSectionVisibility: getVisibleSections returning:', visibleSections.map(s => `${s.id} (order: ${s.order})`));
    return visibleSections;
  }, [sections]);

  const getSectionById = useCallback((id: string) => {
    return sections.find(section => section.id === id);
  }, [sections]);

  const getAllSections = useCallback(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  const toggleSectionVisibility = useCallback(async (sectionId: string) => {
    const section = getSectionById(sectionId);
    if (!section) return;

    // Update local state immediately for UI responsiveness
    setLocalSections(prev => 
      prev.map(s => 
        s.id === sectionId 
          ? { ...s, visible: !s.visible }
          : s
      )
    );

    try {
      // Get current settings first
      const { data: currentSettings } = await supabase.rpc('get_home_settings');
      
      if (currentSettings && typeof currentSettings === 'object') {
        const settings = currentSettings as Record<string, any>;
        const updatedSections = { ...settings.sections };
        
        // Convert dashboard ID to database ID for storage
        const dbSectionId = DASHBOARD_TO_DB_MAPPING[sectionId] || sectionId;
        
        if (updatedSections[dbSectionId]) {
          updatedSections[dbSectionId].visible = !section.visible;
        } else {
          updatedSections[dbSectionId] = { visible: !section.visible, order: section.order };
        }

        // Update site_meta directly
        const { error } = await supabase
          .from('site_meta')
          .upsert({
            key: 'home_settings',
            value: { ...settings, sections: updatedSections }
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to toggle section visibility:', error);
      // Revert local state on error
      setLocalSections(prev => 
        prev.map(s => 
          s.id === sectionId 
            ? { ...s, visible: section.visible }
            : s
        )
      );
    }
  }, [getSectionById]);

  const reorderSections = useCallback(async (newOrder: string[]) => {
    try {
      // Get current settings first
      const { data: currentSettings } = await supabase.rpc('get_home_settings');
      
      if (currentSettings && typeof currentSettings === 'object') {
        const settings = currentSettings as Record<string, any>;
        const updatedSections = { ...settings.sections };
        
        newOrder.forEach((sectionId, index) => {
          // Convert dashboard ID to database ID for storage
          const dbSectionId = DASHBOARD_TO_DB_MAPPING[sectionId] || sectionId;
          
          if (updatedSections[dbSectionId]) {
            updatedSections[dbSectionId].order = index;
          } else {
            updatedSections[dbSectionId] = { visible: true, order: index };
          }
        });

        // Update site_meta directly
        const { error } = await supabase
          .from('site_meta')
          .upsert({
            key: 'home_settings',
            value: { ...settings, sections: updatedSections }
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to reorder sections:', error);
    }
  }, []);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<SectionConfig>) => {
    try {
      // Get current settings first
      const { data: currentSettings } = await supabase.rpc('get_home_settings');
      
      if (currentSettings && typeof currentSettings === 'object') {
        const settings = currentSettings as Record<string, any>;
        const updatedSections = { ...settings.sections };
        
        // Convert dashboard ID to database ID for storage
        const dbSectionId = DASHBOARD_TO_DB_MAPPING[sectionId] || sectionId;
        
        updatedSections[dbSectionId] = { ...updatedSections[dbSectionId], ...updates };

        // Update site_meta directly
        const { error } = await supabase
          .from('site_meta')
          .upsert({
            key: 'home_settings',
            value: { ...settings, sections: updatedSections }
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    try {
      // Reset to default configuration by updating site_meta directly
      const defaultSettings = {
        sections: Object.fromEntries(
          defaultSections.map(section => {
            const dbSectionId = DASHBOARD_TO_DB_MAPPING[section.id] || section.id;
            return [dbSectionId, { visible: section.visible, order: section.order }];
          })
        )
      };

      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: defaultSettings
        });
      
      if (error) throw error;
      
      setLocalSections(defaultSections);
    } catch (error) {
      console.error('Failed to reset to defaults:', error);
    }
  }, []);

  return {
    sections,
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
