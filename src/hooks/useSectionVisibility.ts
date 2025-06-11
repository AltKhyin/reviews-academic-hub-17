
// ABOUTME: Section visibility management with optimized database operations
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SECTION_REGISTRY } from '@/config/sections';

export interface Section {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  [key: string]: any; // Add index signature for JSON compatibility
}

export const useSectionVisibility = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get sections from database or initialize defaults
  const loadSections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_meta')
        .select('value')
        .eq('key', 'section_visibility')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading sections:', error);
        throw error;
      }

      let sectionsData: Section[] = [];

      if (data?.value) {
        // Type guard for JSON data
        const jsonData = data.value as any;
        if (jsonData && typeof jsonData === 'object' && 'sections' in jsonData) {
          sectionsData = jsonData.sections as Section[];
        }
      }

      // If no data, initialize with defaults
      if (sectionsData.length === 0) {
        sectionsData = Object.values(SECTION_REGISTRY).map((section, index) => ({
          id: section.id,
          title: section.title,
          visible: section.defaultVisible ?? true,
          order: index,
        }));
      }

      setSections(sectionsData);
    } catch (error) {
      console.error('Failed to load sections:', error);
      // Initialize with defaults on error
      const defaultSections = Object.values(SECTION_REGISTRY).map((section, index) => ({
        id: section.id,
        title: section.title,
        visible: section.defaultVisible ?? true,
        order: index,
      }));
      setSections(defaultSections);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save sections to database
  const saveSections = useCallback(async (newSections: Section[]) => {
    try {
      const { error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'section_visibility',
          value: { sections: newSections } as any, // Cast to any for JSON compatibility
        });

      if (error) {
        console.error('Error saving sections:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save sections:', error);
      throw error;
    }
  }, []);

  // Toggle section visibility
  const toggleSectionVisibility = useCallback(async (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section
    );
    setSections(updatedSections);
    await saveSections(updatedSections);
  }, [sections, saveSections]);

  // Reorder sections
  const reorderSections = useCallback(async (newOrder: string[]) => {
    const reorderedSections = newOrder.map((sectionId, index) => {
      const section = sections.find(s => s.id === sectionId);
      return section ? { ...section, order: index } : null;
    }).filter(Boolean) as Section[];

    setSections(reorderedSections);
    await saveSections(reorderedSections);
  }, [sections, saveSections]);

  // Update specific section
  const updateSection = useCallback(async (sectionId: string, updates: Partial<Section>) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, ...updates }
        : section
    );
    setSections(updatedSections);
    await saveSections(updatedSections);
  }, [sections, saveSections]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    const defaultSections = Object.values(SECTION_REGISTRY).map((section, index) => ({
      id: section.id,
      title: section.title,
      visible: section.defaultVisible ?? true,
      order: index,
    }));
    setSections(defaultSections);
    await saveSections(defaultSections);
  }, [saveSections]);

  // Get all sections sorted by order
  const getAllSections = useCallback(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  // Load sections on mount
  useEffect(() => {
    loadSections();
  }, [loadSections]);

  return {
    sections,
    isLoading,
    toggleSectionVisibility,
    reorderSections,
    updateSection,
    resetToDefaults,
    getAllSections,
  };
};
