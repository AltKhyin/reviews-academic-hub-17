
// ABOUTME: Hook for managing section visibility configuration
// Simplified version to provide basic functionality

import { useState, useEffect } from 'react';

interface SectionConfig {
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

  const refetch = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  return {
    sectionsConfig,
    isLoading,
    updateSectionVisibility,
    updateSectionOrder,
    refetch
  };
};
