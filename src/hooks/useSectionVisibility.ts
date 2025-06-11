
// ABOUTME: Hook for managing section visibility configuration with unified registry
import { useUnifiedQuery } from './useUnifiedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { SECTION_REGISTRY, getDefaultSectionConfig, getSectionById } from '@/config/sections';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
        console.log('useSectionVisibility: Fetching home settings');
        
        // Use single() with proper error handling for PGRST116 (no rows)
        const { data: metaData, error: metaError } = await supabase
          .from('site_meta')
          .select('value')
          .eq('key', 'home_settings')
          .maybeSingle();
        
        if (metaError) {
          console.warn('useSectionVisibility: site_meta query error:', metaError);
          return getDefaultSectionConfig(isAdmin);
        }

        if (metaData?.value && typeof metaData.value === 'object' && 'sections' in metaData.value) {
          console.log('useSectionVisibility: Found saved settings:', metaData.value);
          return processSectionData(metaData.value.sections, isAdmin);
        }
        
        console.log('useSectionVisibility: Using default configuration');
        return getDefaultSectionConfig(isAdmin);
      } catch (error) {
        console.error('useSectionVisibility: Error fetching settings:', error);
        return getDefaultSectionConfig(isAdmin);
      }
    },
    {
      priority: 'critical',
      staleTime: 20 * 60 * 1000,
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

  const saveSectionsToDatabase = useCallback(async (updatedSections: Section[]) => {
    try {
      console.log('saveSectionsToDatabase: Attempting to save:', { sections: updatedSections });
      
      // Use UPSERT to avoid unique constraint violations
      const { data, error } = await supabase
        .from('site_meta')
        .upsert(
          {
            key: 'home_settings',
            value: { sections: updatedSections }
          },
          { 
            onConflict: 'key',
            ignoreDuplicates: false 
          }
        )
        .select();
      
      if (error) {
        console.error('saveSectionsToDatabase: Database error:', error);
        throw error;
      }
      
      console.log('saveSectionsToDatabase: Successfully saved:', data);
      
      // Invalidate and refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['home-sections'] });
      
      return true;
    } catch (error) {
      console.error('saveSectionsToDatabase: Failed to save:', error);
      throw error;
    }
  }, [queryClient]);

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
      await saveSectionsToDatabase(updatedSections);
      
      toast({
        title: "Configuração salva",
        description: "A visibilidade da seção foi atualizada com sucesso.",
      });
      
    } catch (error) {
      console.error('toggleSectionVisibility: Failed to update section visibility:', error);
      
      // Revert optimistic update
      queryClient.setQueryData(['home-sections', isAdmin], sections);
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [sections, queryClient, isAdmin, saveSectionsToDatabase]);

  const reorderSections = useCallback(async (newOrder: string[]) => {
    if (!Array.isArray(sections)) return;
    
    const reorderedSections = newOrder.map((id, index) => {
      const section = sections.find(s => s.id === id);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean) as Section[];
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections', isAdmin], reorderedSections);
    
    try {
      await saveSectionsToDatabase(reorderedSections);
      
      toast({
        title: "Ordem atualizada",
        description: "A ordem das seções foi alterada com sucesso.",
      });
      
    } catch (error) {
      console.error('reorderSections: Failed to reorder sections:', error);
      
      // Revert optimistic update
      queryClient.setQueryData(['home-sections', isAdmin], sections);
      
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível alterar a ordem das seções. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [sections, queryClient, isAdmin, saveSectionsToDatabase]);

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
      await saveSectionsToDatabase(updatedSections);
      
    } catch (error) {
      console.error('updateSection: Failed to update section:', error);
      
      // Revert optimistic update
      queryClient.setQueryData(['home-sections', isAdmin], sections);
    }
  }, [sections, queryClient, isAdmin, saveSectionsToDatabase]);

  const resetToDefaults = useCallback(async () => {
    const defaultSections = getDefaultSectionConfig(isAdmin);
    
    // Optimistically update cache
    queryClient.setQueryData(['home-sections', isAdmin], defaultSections);
    
    try {
      await saveSectionsToDatabase(defaultSections);
      
      toast({
        title: "Configuração restaurada",
        description: "As seções foram restauradas para a configuração padrão.",
      });
      
    } catch (error) {
      console.error('resetToDefaults: Failed to reset sections:', error);
      
      // Revert optimistic update
      queryClient.setQueryData(['home-sections', isAdmin], sections);
      
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar a configuração padrão. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [sections, queryClient, isAdmin, saveSectionsToDatabase]);

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
    console.warn('processSectionData: Invalid sections data, using defaults');
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
