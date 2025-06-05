
// ABOUTME: Theme utility functions for color transformations and CSS operations
// Provides helper functions for theme management and CSS variable handling

import { EditorTheme } from '@/types/theme';

export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function mergeThemeCustomizations(baseTheme: EditorTheme, customizations: Partial<EditorTheme>): EditorTheme {
  return {
    ...baseTheme,
    editor: { ...baseTheme.editor, ...customizations.editor },
    blocks: { ...baseTheme.blocks, ...customizations.blocks },
    preview: { ...baseTheme.preview, ...customizations.preview },
    palette: { ...baseTheme.palette, ...customizations.palette }
  };
}

export function setNestedProperty(obj: any, path: string, value: string): void {
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

export function applyCSSVariables(theme: EditorTheme): void {
  const root = document.documentElement;

  // Batch DOM updates
  requestAnimationFrame(() => {
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
  });
}
