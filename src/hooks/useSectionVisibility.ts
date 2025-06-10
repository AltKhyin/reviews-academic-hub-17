
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
            return Object.entries(settings.sections).map(([id, config]: [string, any]) => ({
              id,
              title: config?.title || id.replace('_', ' '),
              visible: config?.visible !== false,
              order: config?.order || 0,
            }));
          }
        }
        
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
    return sections.filter(section => section.visible).sort((a, b) => a.order - b.order);
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
      // Use direct table update since RPC functions don't exist
      const currentSettings = await supabase.rpc('get_home_settings');
      if (currentSettings.data && typeof currentSettings.data === 'object') {
        const settings = currentSettings.data as Record<string, any>;
        const updatedSections = { ...settings.sections };
        
        if (updatedSections[sectionId]) {
          updatedSections[sectionId].visible = !section.visible;
        } else {
          updatedSections[sectionId] = { visible: !section.visible, order: section.order };
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
      // Use direct table update since RPC functions don't exist
      const currentSettings = await supabase.rpc('get_home_settings');
      if (currentSettings.data && typeof currentSettings.data === 'object') {
        const settings = currentSettings.data as Record<string, any>;
        const updatedSections = { ...settings.sections };
        
        newOrder.forEach((sectionId, index) => {
          if (updatedSections[sectionId]) {
            updatedSections[sectionId].order = index;
          } else {
            updatedSections[sectionId] = { visible: true, order: index };
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
      // Use direct table update since RPC functions don't exist
      const currentSettings = await supabase.rpc('get_home_settings');
      if (currentSettings.data && typeof currentSettings.data === 'object') {
        const settings = currentSettings.data as Record<string, any>;
        const updatedSections = { ...settings.sections };
        
        updatedSections[sectionId] = { ...updatedSections[sectionId], ...updates };

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
        sections: defaultSections.reduce((acc, section) => {
          acc[section.id] = { visible: section.visible, order: section.order };
          return acc;
        }, {} as Record<string, any>)
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
