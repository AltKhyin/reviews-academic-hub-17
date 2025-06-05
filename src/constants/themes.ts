
// ABOUTME: Default theme definitions and presets for the native editor
// Provides light and dark theme variants with comprehensive color coverage - Updated with better contrast

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
    
    // Interactive Colors - Better contrast for readability
    buttonPrimary: '#495057',
    buttonPrimaryHover: '#343a40',
    buttonSecondary: '#f8f9fa',
    buttonSecondaryHover: '#e9ecef',
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
    // Background Colors - Darker and more consistent
    primaryBg: '#0f0f0f',
    secondaryBg: '#1a1a1a', 
    tertiaryBg: '#262626',
    surfaceBg: '#0f0f0f',
    cardBg: '#1a1a1a',
    hoverBg: '#262626',
    activeBg: '#404040',
    selectedBg: '#525252',
    
    // Border Colors - Better contrast
    primaryBorder: '#404040',
    secondaryBorder: '#525252',
    focusBorder: '#737373',
    activeBorder: '#a3a3a3',
    
    // Text Colors - Better contrast ratios
    primaryText: '#fafafa',
    secondaryText: '#e5e5e5',
    mutedText: '#a3a3a3',
    accentText: '#d4d4d4',
    linkText: '#e5e5e5',
    
    // Status Colors - Adjusted for dark theme
    successColor: '#22c55e',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    infoColor: '#06b6d4',
    
    // Interactive Colors - Fixed contrast issues
    buttonPrimary: '#fafafa',
    buttonPrimaryHover: '#e5e5e5',
    buttonSecondary: '#262626',
    buttonSecondaryHover: '#404040',
    buttonGhost: 'transparent',
    buttonGhostHover: '#262626'
  },
  blocks: {
    // Block-specific colors - Better contrast
    blockBackground: '#1a1a1a',
    blockBorder: '#404040',
    blockHover: '#262626',
    blockSelected: '#404040',
    blockActive: '#525252',
    
    // Block type indicators - Higher contrast
    snapshotCardAccent: '#a3a3a3',
    headingAccent: '#e5e5e5',
    paragraphAccent: '#fafafa',
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
    previewBg: '#0f0f0f',
    previewCardBg: '#1a1a1a',
    previewBorder: '#404040',
    previewHeaderBg: '#1a1a1a',
    previewFooterBg: '#1a1a1a',
    previewScrollbar: '#404040',
    previewScrollbarHover: '#525252'
  },
  palette: {
    paletteBg: '#1a1a1a',
    paletteCardBg: '#262626',
    paletteCardHover: '#404040',
    paletteBorder: '#404040',
    paletteHeaderBg: '#1a1a1a',
    categoryText: '#a3a3a3',
    blockTitleText: '#fafafa',
    blockDescText: '#e5e5e5'
  }
};

export const DEFAULT_THEMES: EditorTheme[] = [LIGHT_THEME, DARK_THEME];

export const DEFAULT_THEME_ID = 'dark';
