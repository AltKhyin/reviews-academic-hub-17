
// ABOUTME: Hook for managing section visibility configuration with caching
import { useOptimizedQuery, queryKeys, queryConfigs } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

interface SectionConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const useSectionVisibility = () => {
  const queryClient = useQueryClient();
  
  const { 
    data: sections, 
    isLoading, 
    error 
  } = useOptimizedQuery<SectionConfig[]>(
    ['home-sections'],
    async (): Promise<SectionConfig[]> => {
      try {
        // Try to get home settings which might contain section configuration
        const { data, error } = await supabase.rpc('get_home_settings');
        
        if (error) {
          console.warn('Home settings error, using defaults:', error);
          return getDefaultSections();
        }

        // If we have data, process it, otherwise use defaults
        if (data && typeof data === 'object' && 'sections' in data) {
          return processSectionData(data.sections);
        }
        
        return getDefaultSections();
      } catch (error) {
        console.warn('Section visibility error, using defaults:', error);
        return getDefaultSections();
      }
    },
    {
      ...queryConfigs.static,
      staleTime: 20 * 60 * 1000, // 20 minutes for section config
    }
  );

  const getVisibleSections = useCallback(() => {
    if (!Array.isArray(sections)) return [];
    return sections.filter(section => section.visible);
  }, [sections]);

  const getAllSections = useCallback(() => {
    if (!Array.isArray(sections)) return [];
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  const toggleSectionVisibility = useCallback(async (sectionId: string) => {
    if (!Array.isArray(sections)) return;
    
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, visible: !section.visible }
        : section
    );
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections'], updatedSections);
    
    try {
      // Update in database
      await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: { sections: updatedSections }
        });
    } catch (error) {
      console.error('Failed to update section visibility:', error);
      // Revert optimistic update
      queryClient.setQueryData(['home-sections'], sections);
    }
  }, [sections, queryClient]);

  const reorderSections = useCallback(async (newOrder: string[]) => {
    if (!Array.isArray(sections)) return;
    
    const reorderedSections = newOrder.map((id, index) => {
      const section = sections.find(s => s.id === id);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean) as SectionConfig[];
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections'], reorderedSections);
    
    try {
      // Update in database
      await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: { sections: reorderedSections }
        });
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      // Revert optimistic update
      queryClient.setQueryData(['home-sections'], sections);
    }
  }, [sections, queryClient]);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<SectionConfig>) => {
    if (!Array.isArray(sections)) return;
    
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates }
        : section
    );
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections'], updatedSections);
    
    try {
      // Update in database
      await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: { sections: updatedSections }
        });
    } catch (error) {
      console.error('Failed to update section:', error);
      // Revert optimistic update
      queryClient.setQueryData(['home-sections'], sections);
    }
  }, [sections, queryClient]);

  const resetToDefaults = useCallback(async () => {
    const defaultSections = getDefaultSections();
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections'], defaultSections);
    
    try {
      // Update in database
      await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: { sections: defaultSections }
        });
    } catch (error) {
      console.error('Failed to reset sections:', error);
      // Revert optimistic update
      queryClient.setQueryData(['home-sections'], sections);
    }
  }, [sections, queryClient]);

  return {
    sections: Array.isArray(sections) ? sections : [],
    isLoading,
    error,
    getVisibleSections,
    getAllSections,
    toggleSectionVisibility,
    reorderSections,
    updateSection,
    resetToDefaults,
  };
};

// Default sections configuration
const getDefaultSections = (): SectionConfig[] => [
  { id: 'featured', title: 'Featured Issue', visible: true, order: 1 },
  { id: 'recent', title: 'Recent Issues', visible: true, order: 2 },
  { id: 'popular', title: 'Popular This Week', visible: true, order: 3 },
  { id: 'discussions', title: 'Latest Discussions', visible: true, order: 4 },
];

// Process section data from database
const processSectionData = (sectionsData: any): SectionConfig[] => {
  if (!Array.isArray(sectionsData)) {
    return getDefaultSections();
  }

  return sectionsData.map((section, index) => ({
    id: section.id || `section-${index}`,
    title: section.title || section.name || `Section ${index + 1}`,
    visible: section.visible !== false,
    order: section.order || index + 1,
  }));
};
