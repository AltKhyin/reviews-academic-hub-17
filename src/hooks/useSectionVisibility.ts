
// ABOUTME: Hook for managing section visibility configuration with unified registry
import { useUnifiedQuery } from './useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { SECTION_REGISTRY, getDefaultSectionConfig, getSectionById } from '@/config/sections';
import { useAuth } from '@/contexts/AuthContext';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

export const useSectionVisibility = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const { 
    data: sections, 
    isLoading, 
    error 
  } = useUnifiedQuery<Section[]>(
    ['home-sections', isAdmin],
    async (): Promise<Section[]> => {
      try {
        // Try to get home settings which might contain section configuration
        const { data, error } = await supabase.rpc('get_home_settings');
        
        if (error) {
          console.warn('Home settings error, using defaults:', error);
          return getDefaultSectionConfig(isAdmin);
        }

        // If we have data, process it, otherwise use defaults
        if (data && typeof data === 'object' && 'sections' in data) {
          return processSectionData(data.sections, isAdmin);
        }
        
        return getDefaultSectionConfig(isAdmin);
      } catch (error) {
        console.warn('Section visibility error, using defaults:', error);
        return getDefaultSectionConfig(isAdmin);
      }
    },
    {
      priority: 'critical',
      staleTime: 20 * 60 * 1000, // 20 minutes for section config
      enableMonitoring: true,
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
    queryClient.setQueryData(['home-sections', isAdmin], updatedSections);
    
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
      queryClient.setQueryData(['home-sections', isAdmin], sections);
    }
  }, [sections, queryClient, isAdmin]);

  const reorderSections = useCallback(async (newOrder: string[]) => {
    if (!Array.isArray(sections)) return;
    
    const reorderedSections = newOrder.map((id, index) => {
      const section = sections.find(s => s.id === id);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean) as Section[];
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections', isAdmin], reorderedSections);
    
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
      queryClient.setQueryData(['home-sections', isAdmin], sections);
    }
  }, [sections, queryClient, isAdmin]);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<Section>) => {
    if (!Array.isArray(sections)) return;
    
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates }
        : section
    );
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections', isAdmin], updatedSections);
    
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
      queryClient.setQueryData(['home-sections', isAdmin], sections);
    }
  }, [sections, queryClient, isAdmin]);

  const resetToDefaults = useCallback(async () => {
    const defaultSections = getDefaultSectionConfig(isAdmin);
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections', isAdmin], defaultSections);
    
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
      queryClient.setQueryData(['home-sections', isAdmin], sections);
    }
  }, [sections, queryClient, isAdmin]);

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

// Process section data from database using unified registry
const processSectionData = (sectionsData: any, userIsAdmin: boolean = false): Section[] => {
  if (!Array.isArray(sectionsData)) {
    return getDefaultSectionConfig(userIsAdmin);
  }

  const processedSections = sectionsData.map((section, index) => {
    const registrySection = getSectionById(section.id);
    
    return {
      id: section.id || `section-${index}`,
      title: registrySection?.title || section.title || section.name || `Section ${index + 1}`,
      visible: section.visible !== false,
      order: section.order !== undefined ? section.order : index + 1,
    };
  }).filter(section => {
    // Filter out admin-only sections for non-admin users
    const registrySection = getSectionById(section.id);
    return !registrySection?.adminOnly || userIsAdmin;
  });

  // Ensure all available sections are included
  const existingIds = new Set(processedSections.map(s => s.id));
  const missingDefaultSections = getDefaultSectionConfig(userIsAdmin)
    .filter(defaultSection => !existingIds.has(defaultSection.id));

  return [...processedSections, ...missingDefaultSections]
    .sort((a, b) => a.order - b.order);
};
