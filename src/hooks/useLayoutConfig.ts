
// ABOUTME: React hook for managing homepage layout configurations
// Provides CRUD operations and persistence for layout customization

import { useState, useEffect, useCallback } from 'react';
import { PageLayoutConfig, SectionLayoutConfig, DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_SPACING, DEFAULT_SIZE } from '@/types/layout';

const STORAGE_KEY = 'homepage_layout_config';
const CONFIG_VERSION = 1;

const createDefaultConfig = (): PageLayoutConfig => ({
  id: 'homepage',
  name: 'Homepage Layout',
  globalPadding: DEFAULT_SPACING,
  globalMargin: DEFAULT_SPACING,
  globalSize: DEFAULT_SIZE,
  sections: DEFAULT_HOMEPAGE_SECTIONS,
  lastModified: new Date().toISOString(),
  version: CONFIG_VERSION
});

export const useLayoutConfig = () => {
  const [config, setConfig] = useState<PageLayoutConfig>(createDefaultConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig) as PageLayoutConfig;
          
          // Validate and migrate if necessary
          if (parsed.version !== CONFIG_VERSION) {
            console.log('Migrating layout config to new version');
            const migratedConfig = migrateConfig(parsed);
            setConfig(migratedConfig);
            saveConfigToStorage(migratedConfig);
          } else {
            setConfig(parsed);
          }
        } else {
          // First time - save default config
          const defaultConfig = createDefaultConfig();
          setConfig(defaultConfig);
          saveConfigToStorage(defaultConfig);
        }
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
  }, []);

  // Save configuration to localStorage
  const saveConfigToStorage = useCallback((configToSave: PageLayoutConfig) => {
    try {
      const updatedConfig = {
        ...configToSave,
        lastModified: new Date().toISOString(),
        version: CONFIG_VERSION
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
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

  // Add a new section
  const addSection = useCallback((section: SectionLayoutConfig) => {
    setConfig(prev => ({
      ...prev,
      sections: [...prev.sections, section]
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Remove a section
  const removeSection = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
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

  // Export configuration as JSON
  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  // Import configuration from JSON
  const importConfig = useCallback((jsonConfig: string) => {
    try {
      const importedConfig = JSON.parse(jsonConfig) as PageLayoutConfig;
      const validatedConfig = validateConfig(importedConfig);
      setConfig(validatedConfig);
      setHasUnsavedChanges(true);
      return { success: true, message: 'Configuration imported successfully' };
    } catch (error) {
      console.error('Error importing config:', error);
      return { success: false, message: 'Invalid configuration format' };
    }
  }, []);

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
    addSection,
    removeSection,
    reorderSections,
    saveConfig,
    resetToDefault,
    exportConfig,
    importConfig,
    getSection,
    getOrderedVisibleSections
  };
};

// Helper function to migrate old config versions
const migrateConfig = (oldConfig: any): PageLayoutConfig => {
  // For now, just create a new default config
  // In the future, this would handle migrations between versions
  console.log('Migrating from old config:', oldConfig);
  return createDefaultConfig();
};

// Helper function to validate imported configuration
const validateConfig = (config: any): PageLayoutConfig => {
  // Basic validation - in production, this would be more comprehensive
  if (!config.id || !config.sections || !Array.isArray(config.sections)) {
    throw new Error('Invalid configuration structure');
  }
  
  return {
    ...createDefaultConfig(),
    ...config,
    version: CONFIG_VERSION
  };
};
