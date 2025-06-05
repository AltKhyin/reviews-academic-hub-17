
// ABOUTME: Default theme definitions and presets for the native editor
// Provides light and dark theme variants with comprehensive color coverage - Updated to use dark as default

import { EditorTheme } from '@/types/theme';

export const LIGHT_THEME: EditorTheme = {
  name: 'Light Theme',
  id: 'light',
  editor: {
    // Background Colors - Grey baseline instead of white/blue
    primaryBg: '#f8f9fa',
    secondaryBg: '#e9ecef',
    tertiaryBg: '#dee2e6',
    surfaceBg: '#f8f9fa',
    cardBg: '#ffffff',
    hoverBg: '#e9ecef',
    activeBg: '#dee2e6',
    selectedBg: '#ced4da',
    
    // Border Colors - Consistent grey palette
    primaryBorder: '#ced4da',
    secondaryBorder: '#adb5bd',
    focusBorder: '#6c757d',
    activeBorder: '#495057',
    
    // Text Colors - High contrast on grey
    primaryText: '#212529',
    secondaryText: '#495057',
    mutedText: '#6c757d',
    accentText: '#343a40',
    linkText: '#495057',
    
    // Status Colors - Muted but distinguishable
    successColor: '#198754',
    warningColor: '#fd7e14',
    errorColor: '#dc3545',
    infoColor: '#0dcaf0',
    
    // Interactive Colors - Grey-based
    buttonPrimary: '#495057',
    buttonPrimaryHover: '#343a40',
    buttonSecondary: '#e9ecef',
    buttonSecondaryHover: '#dee2e6',
    buttonGhost: 'transparent',
    buttonGhostHover: '#e9ecef'
  },
  blocks: {
    // Block-specific colors - Consistent with grey theme
    blockBackground: '#ffffff',
    blockBorder: '#ced4da',
    blockHover: '#f8f9fa',
    blockSelected: '#e9ecef',
    blockActive: '#dee2e6',
    
    // Block type indicators - Subtle variations
    snapshotCardAccent: '#6c757d',
    headingAccent: '#495057',
    paragraphAccent: '#212529',
    figureAccent: '#198754',
    tableAccent: '#fd7e14',
    calloutAccent: '#dc3545',
    quoteAccent: '#6f42c1',
    pollAccent: '#20c997',
    citationAccent: '#6c757d',
    numberCardAccent: '#0dcaf0',
    dividerAccent: '#adb5bd'
  },
  preview: {
    previewBg: '#f8f9fa',
    previewCardBg: '#ffffff',
    previewBorder: '#ced4da',
    previewHeaderBg: '#e9ecef',
    previewFooterBg: '#e9ecef',
    previewScrollbar: '#adb5bd',
    previewScrollbarHover: '#6c757d'
  },
  palette: {
    paletteBg: '#e9ecef',
    paletteCardBg: '#ffffff',
    paletteCardHover: '#f8f9fa',
    paletteBorder: '#ced4da',
    paletteHeaderBg: '#e9ecef',
    categoryText: '#495057',
    blockTitleText: '#212529',
    blockDescText: '#6c757d'
  }
};

export const DARK_THEME: EditorTheme = {
  name: 'Dark Theme',
  id: 'dark',
  editor: {
    // Background Colors - Consistent dark grey palette
    primaryBg: '#1a1a1a',
    secondaryBg: '#2d2d2d',
    tertiaryBg: '#404040',
    surfaceBg: '#1a1a1a',
    cardBg: '#2d2d2d',
    hoverBg: '#404040',
    activeBg: '#525252',
    selectedBg: '#404040',
    
    // Border Colors - Dark grey variations
    primaryBorder: '#404040',
    secondaryBorder: '#525252',
    focusBorder: '#737373',
    activeBorder: '#a3a3a3',
    
    // Text Colors - Light on dark
    primaryText: '#f5f5f5',
    secondaryText: '#d4d4d4',
    mutedText: '#a3a3a3',
    accentText: '#d4d4d4',
    linkText: '#e5e5e5',
    
    // Status Colors - Adjusted for dark theme
    successColor: '#22c55e',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    infoColor: '#06b6d4',
    
    // Interactive Colors - Dark theme appropriate
    buttonPrimary: '#f5f5f5',
    buttonPrimaryHover: '#d4d4d4',
    buttonSecondary: '#404040',
    buttonSecondaryHover: '#525252',
    buttonGhost: 'transparent',
    buttonGhostHover: '#404040'
  },
  blocks: {
    // Block-specific colors - Dark theme
    blockBackground: '#2d2d2d',
    blockBorder: '#404040',
    blockHover: '#404040',
    blockSelected: '#525252',
    blockActive: '#404040',
    
    // Block type indicators - Dark theme variations
    snapshotCardAccent: '#a3a3a3',
    headingAccent: '#d4d4d4',
    paragraphAccent: '#f5f5f5',
    figureAccent: '#22c55e',
    tableAccent: '#f59e0b',
    calloutAccent: '#ef4444',
    quoteAccent: '#8b5cf6',
    pollAccent: '#10b981',
    citationAccent: '#a3a3a3',
    numberCardAccent: '#06b6d4',
    dividerAccent: '#525252'
  },
  preview: {
    previewBg: '#1a1a1a',
    previewCardBg: '#2d2d2d',
    previewBorder: '#404040',
    previewHeaderBg: '#2d2d2d',
    previewFooterBg: '#2d2d2d',
    previewScrollbar: '#404040',
    previewScrollbarHover: '#525252'
  },
  palette: {
    paletteBg: '#2d2d2d',
    paletteCardBg: '#404040',
    paletteCardHover: '#525252',
    paletteBorder: '#404040',
    paletteHeaderBg: '#2d2d2d',
    categoryText: '#a3a3a3',
    blockTitleText: '#f5f5f5',
    blockDescText: '#d4d4d4'
  }
};

export const DEFAULT_THEMES: EditorTheme[] = [LIGHT_THEME, DARK_THEME];

export const DEFAULT_THEME_ID = 'dark'; // Changed from 'light' to 'dark'
