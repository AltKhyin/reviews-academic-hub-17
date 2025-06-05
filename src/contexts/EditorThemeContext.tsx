// ABOUTME: Editor theme context for managing customizable colors and themes
// Provides comprehensive theming system with runtime customization

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { EditorTheme, ThemeContextType, ThemeMode } from '@/types/theme';
import { DEFAULT_THEMES, DEFAULT_THEME_ID, LIGHT_THEME, DARK_THEME } from '@/constants/themes';

const EditorThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface EditorThemeProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'editor-theme-config';

export const EditorThemeProvider: React.FC<EditorThemeProviderProps> = ({ children }) => {
  // Initialize with LIGHT_THEME as default instead of potentially undefined theme
  const [currentTheme, setCurrentTheme] = useState<EditorTheme>(LIGHT_THEME);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light'); // Changed from 'auto' to 'light'
  const [customizations, setCustomizations] = useState<Partial<EditorTheme>>({});
  const [availableThemes] = useState<EditorTheme[]>(DEFAULT_THEMES);

  // Load theme configuration from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        if (config.themeId) {
          const theme = availableThemes.find(t => t.id === config.themeId) || LIGHT_THEME;
          setCurrentTheme(theme);
        }
        if (config.themeMode) {
          setThemeMode(config.themeMode);
        }
        if (config.customizations) {
          setCustomizations(config.customizations);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme configuration:', error);
      // Fallback to light theme
      setCurrentTheme(LIGHT_THEME);
      setThemeMode('light');
    }
  }, [availableThemes]);

  // Apply theme based on mode and system preference
  const getEffectiveTheme = useCallback((): EditorTheme => {
    let baseTheme = currentTheme;
    
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      baseTheme = prefersDark ? DARK_THEME : LIGHT_THEME;
    }

    // Apply customizations
    if (Object.keys(customizations).length > 0) {
      return mergeThemeCustomizations(baseTheme, customizations);
    }

    return baseTheme;
  }, [currentTheme, themeMode, customizations]);

  const appliedTheme = getEffectiveTheme();

  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const theme = appliedTheme;

    // Apply editor colors
    Object.entries(theme.editor).forEach(([key, value]) => {
      root.style.setProperty(`--editor-${camelToKebab(key)}`, value);
    });

    // Apply block colors
    Object.entries(theme.blocks).forEach(([key, value]) => {
      root.style.setProperty(`--block-${camelToKebab(key)}`, value);
    });

    // Apply preview colors
    Object.entries(theme.preview).forEach(([key, value]) => {
      root.style.setProperty(`--preview-${camelToKebab(key)}`, value);
    });

    // Apply palette colors
    Object.entries(theme.palette).forEach(([key, value]) => {
      root.style.setProperty(`--palette-${camelToKebab(key)}`, value);
    });
  }, [appliedTheme]);

  // Save configuration to localStorage
  const saveConfiguration = useCallback(() => {
    try {
      const config = {
        themeId: currentTheme.id,
        themeMode,
        customizations,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save theme configuration:', error);
    }
  }, [currentTheme.id, themeMode, customizations]);

  useEffect(() => {
    saveConfiguration();
  }, [saveConfiguration]);

  // Theme actions
  const setTheme = useCallback((themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [availableThemes]);

  const setThemeModeHandler = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
  }, []);

  const customizeColor = useCallback((path: string, value: string) => {
    setCustomizations(prev => {
      const newCustomizations = { ...prev };
      setNestedProperty(newCustomizations, path, value);
      return newCustomizations;
    });
  }, []);

  const resetCustomizations = useCallback(() => {
    setCustomizations({});
  }, []);

  const exportTheme = useCallback((): string => {
    const exportData = {
      theme: currentTheme,
      customizations,
      themeMode,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }, [currentTheme, customizations, themeMode]);

  const importTheme = useCallback((themeData: string) => {
    try {
      const imported = JSON.parse(themeData);
      if (imported.theme) {
        setCurrentTheme(imported.theme);
      }
      if (imported.customizations) {
        setCustomizations(imported.customizations);
      }
      if (imported.themeMode) {
        setThemeMode(imported.themeMode);
      }
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw new Error('Invalid theme data format');
    }
  }, []);

  const contextValue: ThemeContextType = {
    currentTheme,
    appliedTheme,
    themeMode,
    availableThemes,
    customizations,
    setTheme,
    setThemeMode: setThemeModeHandler,
    customizeColor,
    resetCustomizations,
    exportTheme,
    importTheme
  };

  return (
    <EditorThemeContext.Provider value={contextValue}>
      {children}
    </EditorThemeContext.Provider>
  );
};

export const useEditorTheme = (): ThemeContextType => {
  const context = useContext(EditorThemeContext);
  if (!context) {
    throw new Error('useEditorTheme must be used within an EditorThemeProvider');
  }
  return context;
};

// Utility functions
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function mergeThemeCustomizations(baseTheme: EditorTheme, customizations: Partial<EditorTheme>): EditorTheme {
  return {
    ...baseTheme,
    editor: { ...baseTheme.editor, ...customizations.editor },
    blocks: { ...baseTheme.blocks, ...customizations.blocks },
    preview: { ...baseTheme.preview, ...customizations.preview },
    palette: { ...baseTheme.palette, ...customizations.palette }
  };
}

function setNestedProperty(obj: any, path: string, value: string): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}
