
// ABOUTME: Optimized section visibility management with proper state synchronization
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
  [key: string]: any; // Add index signature for Json compatibility
}

// Type guard for section configuration
const isSectionConfig = (obj: any): obj is Record<string, any> => {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
};

export const useOptimizedSectionVisibility = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load sections from database with local state management
  const loadSections = useCallback(async () => {
    try {
      const { data: settings, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'home_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let sectionsConfig: Record<string, any> = {};
      
      // Safe type checking and property access
      if (settings?.value && isSectionConfig(settings.value)) {
        const value = settings.value as any;
        sectionsConfig = value.sections || {};
      }
      
      // Initialize with registry defaults if no settings exist
      if (!settings || Object.keys(sectionsConfig).length === 0) {
        sectionsConfig = SECTION_REGISTRY.reduce((acc, section) => {
          acc[section.id] = {
            visible: section.defaultVisible,
            order: section.defaultOrder
          };
          return acc;
        }, {} as any);
      }

      const sectionsList = SECTION_REGISTRY.map(section => ({
        id: section.id,
        title: section.title,
        visible: sectionsConfig[section.id]?.visible ?? section.defaultVisible,
        order: sectionsConfig[section.id]?.order ?? section.defaultOrder,
      })).sort((a, b) => a.order - b.order);

      setSections(sectionsList);
    } catch (error) {
      console.error('Error loading section settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações das seções.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save sections with optimistic updates and proper error handling
  const saveSections = useCallback(async (newSections: Section[]) => {
    try {
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

      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: settingsValue
        });

      if (error) throw error;

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['home-settings'] });
      
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
      // Revert optimistic update on failure
      await loadSections();
    }
  }, [sections, saveSections, loadSections]);

  // Reorder sections with optimistic updates
  const reorderSections = useCallback(async (newOrder: string[]) => {
    const reorderedSections = newOrder.map((id, index) => {
      const section = sections.find(s => s.id === id);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean) as Section[];

    // Optimistic update
    setSections(reorderedSections);

    const success = await saveSections(reorderedSections);
    
    if (!success) {
      // Revert optimistic update on failure
      await loadSections();
    }
  }, [sections, saveSections, loadSections]);

  // Toggle section visibility
  const toggleSectionVisibility = useCallback(async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    await updateSection(sectionId, { visible: !section.visible });
  }, [sections, updateSection]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    const defaultSections = SECTION_REGISTRY.map(section => ({
      id: section.id,
      title: section.title,
      visible: section.defaultVisible,
      order: section.defaultOrder,
    })).sort((a, b) => a.order - b.order);

    setSections(defaultSections);
    await saveSections(defaultSections);
  }, [saveSections]);

  // Get all sections sorted by order
  const getAllSections = useCallback(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  // Get visible sections (alias for compatibility)
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
    getVisibleSections, // Add this method for compatibility
  };
};
