
// ABOUTME: Hook for managing section visibility configuration
// Enhanced version with all required methods and types

import { useState, useEffect } from 'react';

export interface SectionConfig {
  visible: boolean;
  order: number;
  title: string;
}

export interface Section {
  id: string;
  visible: boolean;
  order: number;
  title: string;
}

interface SectionsConfig {
  [sectionId: string]: SectionConfig;
}

const DEFAULT_SECTIONS: SectionsConfig = {
  featured: { visible: true, order: 0, title: 'Em Destaque' },
  recent: { visible: true, order: 1, title: 'Recentes' },
  recommended: { visible: true, order: 2, title: 'Recomendados' },
  trending: { visible: true, order: 3, title: 'Em Alta' },
  reviewer: { visible: true, order: 4, title: 'Notas dos Revisores' },
  upcoming: { visible: true, order: 5, title: 'Próximas Publicações' }
};

export const useSectionVisibility = () => {
  const [sectionsConfig, setSectionsConfig] = useState<SectionsConfig>(DEFAULT_SECTIONS);
  const [isLoading, setIsLoading] = useState(false);

  const updateSectionVisibility = async (sectionId: string, updates: Partial<SectionConfig>) => {
    setSectionsConfig(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        ...updates
      }
    }));
  };

  const updateSectionOrder = async (sectionId: string, newOrder: number) => {
    await updateSectionVisibility(sectionId, { order: newOrder });
  };

  const updateSection = async (sectionId: string, updates: Partial<SectionConfig>) => {
    return updateSectionVisibility(sectionId, updates);
  };

  const toggleSectionVisibility = async (sectionId: string) => {
    const section = sectionsConfig[sectionId];
    if (section) {
      await updateSectionVisibility(sectionId, { visible: !section.visible });
    }
  };

  const reorderSections = async (newOrder: string[]) => {
    const updates: SectionsConfig = {};
    newOrder.forEach((sectionId, index) => {
      if (sectionsConfig[sectionId]) {
        updates[sectionId] = {
          ...sectionsConfig[sectionId],
          order: index
        };
      }
    });
    setSectionsConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = async () => {
    setSectionsConfig(DEFAULT_SECTIONS);
  };

  const getAllSections = (): Section[] => {
    return Object.entries(sectionsConfig).map(([id, config]) => ({
      id,
      ...config
    })).sort((a, b) => a.order - b.order);
  };

  const sections = getAllSections();

  const refetch = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  return {
    sectionsConfig,
    sections,
    isLoading,
    updateSectionVisibility,
    updateSectionOrder,
    updateSection,
    toggleSectionVisibility,
    reorderSections,
    resetToDefaults,
    getAllSections,
    refetch
  };
};
