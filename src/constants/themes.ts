
// ABOUTME: Default theme definitions and presets for the native editor
// Fixed contrast issues and improved color relationships for better accessibility

import { EditorTheme } from '@/types/theme';

export const LIGHT_THEME: EditorTheme = {
  name: 'Light Theme',
  id: 'light',
  editor: {
    // Background Colors - Clean grey baseline
    primaryBg: '#ffffff',
    secondaryBg: '#f8f9fa',
    tertiaryBg: '#e9ecef',
    surfaceBg: '#f8f9fa',
    cardBg: '#ffffff',
    hoverBg: '#f1f3f4',
    activeBg: '#e8eaed',
    selectedBg: '#e3f2fd',
    
    // Border Colors - Subtle but visible
    primaryBorder: '#dee2e6',
    secondaryBorder: '#ced4da',
    focusBorder: '#1976d2',
    activeBorder: '#1565c0',
    
    // Text Colors - High contrast for readability
    primaryText: '#1a1a1a',
    secondaryText: '#5f6368',
    mutedText: '#80868b',
    accentText: '#1976d2',
    linkText: '#1976d2',
    
    // Status Colors - Clear and accessible
    successColor: '#1b5e20',
    warningColor: '#ef6c00',
    errorColor: '#c62828',
    infoColor: '#0277bd',
    
    // Interactive Colors - Fixed contrast issues
    buttonPrimary: '#1976d2',
    buttonPrimaryHover: '#1565c0',
    buttonSecondary: '#ffffff',
    buttonSecondaryHover: '#f1f3f4',
    buttonGhost: 'transparent',
    buttonGhostHover: '#f1f3f4'
  },
  blocks: {
    blockBackground: '#ffffff',
    blockBorder: '#dee2e6',
    blockHover: '#f8f9fa',
    blockSelected: '#e3f2fd',
    blockActive: '#bbdefb',
    
    snapshotCardAccent: '#1976d2',
    headingAccent: '#1a1a1a',
    paragraphAccent: '#5f6368',
    figureAccent: '#1b5e20',
    tableAccent: '#ef6c00',
    calloutAccent: '#c62828',
    quoteAccent: '#7b1fa2',
    pollAccent: '#00695c',
    citationAccent: '#5f6368',
    numberCardAccent: '#0277bd',
    dividerAccent: '#ced4da'
  },
  preview: {
    previewBg: '#ffffff',
    previewCardBg: '#ffffff',
    previewBorder: '#dee2e6',
    previewHeaderBg: '#f8f9fa',
    previewFooterBg: '#f8f9fa',
    previewScrollbar: '#ced4da',
    previewScrollbarHover: '#80868b'
  },
  palette: {
    paletteBg: '#f8f9fa',
    paletteCardBg: '#ffffff',
    paletteCardHover: '#f1f3f4',
    paletteBorder: '#dee2e6',
    paletteHeaderBg: '#f8f9fa',
    categoryText: '#5f6368',
    blockTitleText: '#1a1a1a',
    blockDescText: '#80868b'
  }
};

export const DARK_THEME: EditorTheme = {
  name: 'Dark Theme',
  id: 'dark',
  editor: {
    // Background Colors - Rich dark with proper contrast
    primaryBg: '#0d1117',
    secondaryBg: '#161b22', 
    tertiaryBg: '#21262d',
    surfaceBg: '#0d1117',
    cardBg: '#161b22',
    hoverBg: '#21262d',
    activeBg: '#30363d',
    selectedBg: '#1f2937',
    
    // Border Colors - Visible but not harsh
    primaryBorder: '#30363d',
    secondaryBorder: '#21262d',
    focusBorder: '#58a6ff',
    activeBorder: '#1f6feb',
    
    // Text Colors - High contrast for dark theme
    primaryText: '#f0f6fc',
    secondaryText: '#c9d1d9',
    mutedText: '#8b949e',
    accentText: '#58a6ff',
    linkText: '#58a6ff',
    
    // Status Colors - Adapted for dark backgrounds
    successColor: '#3fb950',
    warningColor: '#ffab40',
    errorColor: '#f85149',
    infoColor: '#58a6ff',
    
    // Interactive Colors - Proper contrast ratios
    buttonPrimary: '#238636',
    buttonPrimaryHover: '#2ea043',
    buttonSecondary: '#21262d',
    buttonSecondaryHover: '#30363d',
    buttonGhost: 'transparent',
    buttonGhostHover: '#21262d'
  },
  blocks: {
    blockBackground: '#161b22',
    blockBorder: '#30363d',
    blockHover: '#21262d',
    blockSelected: '#1f2937',
    blockActive: '#374151',
    
    snapshotCardAccent: '#58a6ff',
    headingAccent: '#f0f6fc',
    paragraphAccent: '#c9d1d9',
    figureAccent: '#3fb950',
    tableAccent: '#ffab40',
    calloutAccent: '#f85149',
    quoteAccent: '#bc8cff',
    pollAccent: '#39d353',
    citationAccent: '#8b949e',
    numberCardAccent: '#58a6ff',
    dividerAccent: '#21262d'
  },
  preview: {
    previewBg: '#0d1117',
    previewCardBg: '#161b22',
    previewBorder: '#30363d',
    previewHeaderBg: '#161b22',
    previewFooterBg: '#161b22',
    previewScrollbar: '#30363d',
    previewScrollbarHover: '#484f58'
  },
  palette: {
    paletteBg: '#161b22',
    paletteCardBg: '#21262d',
    paletteCardHover: '#30363d',
    paletteBorder: '#30363d',
    paletteHeaderBg: '#161b22',
    categoryText: '#8b949e',
    blockTitleText: '#f0f6fc',
    blockDescText: '#c9d1d9'
  }
};

export const DEFAULT_THEMES: EditorTheme[] = [LIGHT_THEME, DARK_THEME];

export const DEFAULT_THEME_ID = 'dark';
