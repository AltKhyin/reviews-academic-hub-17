
// ABOUTME: Enhanced section visibility management with comprehensive database handling and admin panel integration
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { SECTION_REGISTRY, getSectionById } from '@/config/sections';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  [key: string]: any;
}

// Type guard for section configuration
const isSectionConfig = (obj: any): obj is Record<string, any> => {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
};

// Helper to safely create sections from any data format
const createSectionsFromData = (data: any): Section[] => {
  // If data is already an array of sections
  if (Array.isArray(data)) {
    return data.map(section => ({
      id: section.id,
      title: section.title || getSectionById(section.id)?.title || section.id,
      visible: section.visible ?? true,
      order: section.order ?? 0
    }));
  }
  
  // If data is an object with sections property
  if (data && data.sections) {
    // Handle object format: { sections: { reviewer: {visible: true, order: 0}, ... } }
    if (typeof data.sections === 'object' && !Array.isArray(data.sections)) {
      return SECTION_REGISTRY.map(regSection => {
        const sectionData = data.sections[regSection.id] || {};
        return {
          id: regSection.id,
          title: regSection.title,
          visible: sectionData.visible ?? regSection.defaultVisible,
          order: sectionData.order ?? regSection.defaultOrder
        };
      });
    }
    
    // Handle array format: { sections: [{id: 'reviewer', visible: true, order: 0}, ...] }
    if (Array.isArray(data.sections)) {
      return data.sections.map(section => ({
        id: section.id,
        title: section.title || getSectionById(section.id)?.title || section.id,
        visible: section.visible ?? true,
        order: section.order ?? 0
      }));
    }
  }
  
  // Default fallback - return registry defaults
  return SECTION_REGISTRY.map(section => ({
    id: section.id,
    title: section.title,
    visible: section.defaultVisible,
    order: section.defaultOrder
  }));
};

export const useOptimizedSectionVisibility = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load sections from database with comprehensive format handling
  const loadSections = useCallback(async () => {
    try {
      console.log('useOptimizedSectionVisibility: Loading sections...');
      
      // First try to get from home_settings
      const { data: homeSettings, error: homeError } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'home_settings')
        .maybeSingle();

      let sectionsData: Section[] = [];

      if (!homeError && homeSettings?.value) {
        console.log('useOptimizedSectionVisibility: Found home_settings data');
        sectionsData = createSectionsFromData(homeSettings.value);
      } else {
        // Fallback to section_visibility
        const { data: sectionSettings, error: sectionError } = await supabase
          .from('site_meta')
          .select('value')
          .eq('key', 'section_visibility')
          .maybeSingle();

        if (!sectionError && sectionSettings?.value) {
          console.log('useOptimizedSectionVisibility: Found section_visibility data');
          sectionsData = createSectionsFromData(sectionSettings.value);
        } else {
          console.log('useOptimizedSectionVisibility: Using registry defaults');
          sectionsData = createSectionsFromData(null);
        }
      }

      // Ensure all sections from registry are present
      const registryIds = SECTION_REGISTRY.map(s => s.id);
      const existingIds = sectionsData.map(s => s.id);
      const missingIds = registryIds.filter(id => !existingIds.includes(id));
      
      // Add missing sections with defaults
      missingIds.forEach(id => {
        const regSection = SECTION_REGISTRY.find(s => s.id === id);
        if (regSection) {
          sectionsData.push({
            id: regSection.id,
            title: regSection.title,
            visible: regSection.defaultVisible,
            order: regSection.defaultOrder
          });
        }
      });

      // Sort by order
      sectionsData.sort((a, b) => a.order - b.order);
      
      console.log('useOptimizedSectionVisibility: Loaded sections:', sectionsData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading section settings:', error);
      // Use registry defaults on error
      const defaultSections = createSectionsFromData(null);
      setSections(defaultSections);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações das seções. Usando configurações padrão.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save sections with comprehensive format handling and direct upsert
  const saveSections = useCallback(async (newSections: Section[]) => {
    try {
      console.log('useOptimizedSectionVisibility: Saving sections:', newSections);
      
      // Create the standardized format for home_settings
      const sectionsConfig = newSections.reduce((acc, section) => {
        acc[section.id] = {
          visible: section.visible,
          order: section.order
        };
        return acc;
      }, {} as any);

      const settingsValue = {
        sections: sectionsConfig,
        recent_issues: { days_for_new_badge: 7, max_items: 10 },
        popular_issues: { period: "week", max_items: 10 },
        recommended_issues: { max_items: 10 }
      };

      // Use direct upsert instead of RPC to avoid TypeScript issues
      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: settingsValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Error upserting site_meta:', error);
        throw error;
      }

      console.log('useOptimizedSectionVisibility: Successfully saved sections');

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['home-settings'] });
      queryClient.invalidateQueries({ queryKey: ['sidebarConfig'] });
      
      return true;
    } catch (error) {
      console.error('Error saving section settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      return false;
    }
  }, [queryClient]);

  // Update individual section with optimistic updates
  const updateSection = useCallback(async (sectionId: string, updates: Partial<Section>) => {
    console.log('useOptimizedSectionVisibility: Updating section:', sectionId, updates);
    
    // Optimistic update
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, ...updates }
          : section
      )
    );

    const newSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates }
        : section
    );

    const success = await saveSections(newSections);
    
    if (!success) {
      console.log('useOptimizedSectionVisibility: Save failed, reverting optimistic update');
      // Revert optimistic update on failure
      await loadSections();
    }
  }, [sections, saveSections, loadSections]);

  // Reorder sections with optimistic updates
  const reorderSections = useCallback(async (newOrder: string[]) => {
    console.log('useOptimizedSectionVisibility: Reordering sections:', newOrder);
    
    const reorderedSections = newOrder.map((id, index) => {
      const section = sections.find(s => s.id === id);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean) as Section[];

    // Optimistic update
    setSections(reorderedSections);

    const success = await saveSections(reorderedSections);
    
    if (!success) {
      console.log('useOptimizedSectionVisibility: Reorder failed, reverting optimistic update');
      // Revert optimistic update on failure
      await loadSections();
    }
  }, [sections, saveSections, loadSections]);

  // Toggle section visibility
  const toggleSectionVisibility = useCallback(async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) {
      console.warn('useOptimizedSectionVisibility: Section not found:', sectionId);
      return;
    }

    console.log('useOptimizedSectionVisibility: Toggling visibility for:', sectionId);
    await updateSection(sectionId, { visible: !section.visible });
  }, [sections, updateSection]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    console.log('useOptimizedSectionVisibility: Resetting to defaults');
    
    const defaultSections = createSectionsFromData(null);
    setSections(defaultSections);
    
    const success = await saveSections(defaultSections);
    if (!success) {
      console.log('useOptimizedSectionVisibility: Reset failed, reverting');
      await loadSections();
    }
  }, [saveSections, loadSections]);

  // Get all sections sorted by order
  const getAllSections = useCallback(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  // Get visible sections only
  const getVisibleSections = useCallback(() => {
    return sections.filter(section => section.visible).sort((a, b) => a.order - b.order);
  }, [sections]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  return {
    sections,
    isLoading,
    updateSection,
    reorderSections,
    toggleSectionVisibility,
    resetToDefaults,
    getAllSections,
    getVisibleSections,
  };
};
