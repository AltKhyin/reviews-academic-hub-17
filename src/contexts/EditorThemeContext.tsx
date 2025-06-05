
// ABOUTME: Editor theme context with real-time updates and optimized performance
// Provides comprehensive theming system with debounced updates

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { EditorTheme, ThemeContextType, ThemeMode } from '@/types/theme';
import { DEFAULT_THEMES, LIGHT_THEME, DARK_THEME } from '@/constants/themes';
import { useThemeStorage } from '@/hooks/useThemeStorage';
import { mergeThemeCustomizations, setNestedProperty, applyCSSVariables } from '@/utils/themeUtils';

const EditorThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface EditorThemeProviderProps {
  children: React.ReactNode;
}

export const EditorThemeProvider: React.FC<EditorThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<EditorTheme>(DARK_THEME);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [customizations, setCustomizations] = useState<Partial<EditorTheme>>({});
  const [availableThemes] = useState<EditorTheme[]>(DEFAULT_THEMES);

  const { loadConfiguration } = useThemeStorage(currentTheme, themeMode, customizations);

  // Load theme configuration from localStorage
  useEffect(() => {
    const config = loadConfiguration();
    if (config) {
      if (config.themeId) {
        const theme = availableThemes.find(t => t.id === config.themeId) || DARK_THEME;
        setCurrentTheme(theme);
      }
      if (config.themeMode) {
        setThemeMode(config.themeMode);
      }
      if (config.customizations) {
        setCustomizations(config.customizations);
      }
    }
  }, [availableThemes, loadConfiguration]);

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

  // Memoize the applied theme for performance
  const appliedTheme = useMemo(() => getEffectiveTheme(), [getEffectiveTheme]);

  // Apply CSS custom properties with optimized updates
  useEffect(() => {
    applyCSSVariables(appliedTheme);
  }, [appliedTheme]);

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
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(exportData, null, 2);
  }, [currentTheme, customizations, themeMode]);

  const importTheme = useCallback((themeData: string) => {
    try {
      const imported = JSON.parse(themeData);
      
      if (!imported.theme && !imported.customizations) {
        throw new Error('Invalid theme data structure');
      }
      
      if (imported.theme && imported.theme.editor && imported.theme.blocks) {
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
