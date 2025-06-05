
// ABOUTME: Theme configuration storage and persistence hook
// Handles localStorage operations for theme settings with debouncing

import { useCallback, useEffect } from 'react';
import { EditorTheme, ThemeMode } from '@/types/theme';

const STORAGE_KEY = 'editor-theme-config';

interface ThemeStorageConfig {
  themeId: string;
  themeMode: ThemeMode;
  customizations: Partial<EditorTheme>;
}

export const useThemeStorage = (
  currentTheme: EditorTheme,
  themeMode: ThemeMode,
  customizations: Partial<EditorTheme>
) => {
  const saveConfiguration = useCallback(() => {
    const timeoutId = setTimeout(() => {
      try {
        const config: ThemeStorageConfig = {
          themeId: currentTheme.id,
          themeMode,
          customizations
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.warn('Failed to save theme configuration:', error);
      }
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timeoutId);
  }, [currentTheme.id, themeMode, customizations]);

  const loadConfiguration = useCallback((): ThemeStorageConfig | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load theme configuration:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    const cleanup = saveConfiguration();
    return cleanup;
  }, [saveConfiguration]);

  return { loadConfiguration };
};
