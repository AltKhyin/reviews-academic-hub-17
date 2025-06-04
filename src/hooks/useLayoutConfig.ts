// ABOUTME: React hook for managing homepage layout configurations
// Provides CRUD operations and persistence for layout customization

import { useState, useEffect, useCallback } from 'react';
import { PageLayoutConfig, SectionLayoutConfig, DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_SPACING, DEFAULT_SIZE } from '@/types/layout';

const STORAGE_KEY = 'homepage_layout_config';
const CONFIG_VERSION = 1;

// Define all available sections that can be customized
const ALL_HOMEPAGE_SECTIONS: SectionLayoutConfig[] = [
  {
    id: 'hero',
    name: 'Hero Section',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    size: { maxWidth: 'max-w-3xl', width: 'w-full' },
    visible: true,
    order: 0
  },
  {
    id: 'articles',
    name: 'Articles Grid',
    padding: { top: 12, right: 4, bottom: 12, left: 4 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 1
  },
  {
    id: 'reviews',
    name: 'Reviews do Editor',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 4, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 2
  },
  {
    id: 'reviewer',
    name: 'Notas do Revisor',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 4, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 3
  },
  {
    id: 'featured',
    name: 'Edições em Destaque',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 4, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 4
  },
  {
    id: 'upcoming',
    name: 'Próximas Edições',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 4, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 5
  },
  {
    id: 'recent',
    name: 'Edições Recentes',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 4, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 6
  },
  {
    id: 'recommended',
    name: 'Recomendados',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 4, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 7
  },
  {
    id: 'trending',
    name: 'Mais Acessados',
    padding: { top: 8, right: 4, bottom: 8, left: 4 },
    margin: { top: 0, right: 0, bottom: 4, left: 0 },
    size: { maxWidth: 'max-w-5xl', width: 'w-full' },
    visible: true,
    order: 8
  }
];

const createDefaultConfig = (): PageLayoutConfig => ({
  id: 'homepage',
  name: 'Homepage Layout',
  globalPadding: DEFAULT_SPACING,
  globalMargin: DEFAULT_SPACING,
  globalSize: DEFAULT_SIZE,
  sections: ALL_HOMEPAGE_SECTIONS,
  lastModified: new Date().toISOString(),
  version: CONFIG_VERSION
});

export const useLayoutConfig = () => {
  const [config, setConfig] = useState<PageLayoutConfig>(createDefaultConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync with section visibility settings from localStorage
  const syncWithSectionVisibility = useCallback(() => {
    try {
      const savedSections = localStorage.getItem('homepage_sections');
      if (savedSections) {
        const visibilityData = JSON.parse(savedSections);
        
        setConfig(prev => ({
          ...prev,
          sections: prev.sections.map(section => {
            const visibilitySection = visibilityData.find((v: any) => v.id === section.id);
            if (visibilitySection) {
              return {
                ...section,
                visible: visibilitySection.visible,
                order: visibilitySection.order
              };
            }
            return section;
          })
        }));
      }
    } catch (error) {
      console.error('Error syncing with section visibility:', error);
    }
  }, []);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig) as PageLayoutConfig;
          
          // Ensure all sections exist and merge with default sections
          const mergedSections = ALL_HOMEPAGE_SECTIONS.map(defaultSection => {
            const savedSection = parsed.sections?.find(s => s.id === defaultSection.id);
            return savedSection ? { ...defaultSection, ...savedSection } : defaultSection;
          });

          const migratedConfig = {
            ...createDefaultConfig(),
            ...parsed,
            sections: mergedSections,
            version: CONFIG_VERSION
          };
          
          setConfig(migratedConfig);
        } else {
          const defaultConfig = createDefaultConfig();
          setConfig(defaultConfig);
          saveConfigToStorage(defaultConfig);
        }
        
        // Sync with existing section visibility settings
        syncWithSectionVisibility();
      } catch (error) {
        console.error('Error loading layout config:', error);
        const defaultConfig = createDefaultConfig();
        setConfig(defaultConfig);
        saveConfigToStorage(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [syncWithSectionVisibility]);

  // Save configuration to localStorage
  const saveConfigToStorage = useCallback((configToSave: PageLayoutConfig) => {
    try {
      const updatedConfig = {
        ...configToSave,
        lastModified: new Date().toISOString(),
        version: CONFIG_VERSION
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      
      // Also update the section visibility storage to keep them in sync
      const visibilityData = configToSave.sections.map(section => ({
        id: section.id,
        title: section.name,
        visible: section.visible,
        order: section.order
      }));
      localStorage.setItem('homepage_sections', JSON.stringify(visibilityData));
      
      console.log('Layout config saved successfully');
    } catch (error) {
      console.error('Error saving layout config:', error);
    }
  }, []);

  // Update entire configuration
  const updateConfig = useCallback((newConfig: Partial<PageLayoutConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Update a specific section
  const updateSection = useCallback((sectionId: string, updates: Partial<SectionLayoutConfig>) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, ...updates }
          : section
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Reorder sections
  const reorderSections = useCallback((newOrder: string[]) => {
    setConfig(prev => {
      const reorderedSections = newOrder.map((id, index) => {
        const section = prev.sections.find(s => s.id === id);
        return section ? { ...section, order: index } : null;
      }).filter(Boolean) as SectionLayoutConfig[];

      return {
        ...prev,
        sections: reorderedSections
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save current configuration
  const saveConfig = useCallback(() => {
    saveConfigToStorage(config);
    setHasUnsavedChanges(false);
  }, [config, saveConfigToStorage]);

  // Reset to default configuration
  const resetToDefault = useCallback(() => {
    const defaultConfig = createDefaultConfig();
    setConfig(defaultConfig);
    saveConfigToStorage(defaultConfig);
    setHasUnsavedChanges(false);
  }, [saveConfigToStorage]);

  // Get section by ID
  const getSection = useCallback((sectionId: string): SectionLayoutConfig | undefined => {
    return config.sections.find(section => section.id === sectionId);
  }, [config.sections]);

  // Get ordered visible sections
  const getOrderedVisibleSections = useCallback((): SectionLayoutConfig[] => {
    return config.sections
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
  }, [config.sections]);

  return {
    config,
    isLoading,
    hasUnsavedChanges,
    updateConfig,
    updateSection,
    reorderSections,
    saveConfig,
    resetToDefault,
    getSection,
    getOrderedVisibleSections,
    syncWithSectionVisibility
  };
};
