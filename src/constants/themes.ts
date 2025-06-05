
// ABOUTME: Default theme definitions and presets for the native editor
// Provides light and dark theme variants with comprehensive color coverage - Updated to use grey baseline

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
    primaryBg: '#212529',
    secondaryBg: '#343a40',
    tertiaryBg: '#495057',
    surfaceBg: '#212529',
    cardBg: '#343a40',
    hoverBg: '#495057',
    activeBg: '#6c757d',
    selectedBg: '#495057',
    
    // Border Colors - Dark grey variations
    primaryBorder: '#495057',
    secondaryBorder: '#6c757d',
    focusBorder: '#adb5bd',
    activeBorder: '#ced4da',
    
    // Text Colors - Light on dark
    primaryText: '#f8f9fa',
    secondaryText: '#e9ecef',
    mutedText: '#adb5bd',
    accentText: '#ced4da',
    linkText: '#dee2e6',
    
    // Status Colors - Adjusted for dark theme
    successColor: '#198754',
    warningColor: '#fd7e14',
    errorColor: '#dc3545',
    infoColor: '#0dcaf0',
    
    // Interactive Colors - Dark theme appropriate
    buttonPrimary: '#f8f9fa',
    buttonPrimaryHover: '#e9ecef',
    buttonSecondary: '#495057',
    buttonSecondaryHover: '#6c757d',
    buttonGhost: 'transparent',
    buttonGhostHover: '#495057'
  },
  blocks: {
    // Block-specific colors - Dark theme
    blockBackground: '#343a40',
    blockBorder: '#495057',
    blockHover: '#495057',
    blockSelected: '#6c757d',
    blockActive: '#495057',
    
    // Block type indicators - Dark theme variations
    snapshotCardAccent: '#adb5bd',
    headingAccent: '#ced4da',
    paragraphAccent: '#f8f9fa',
    figureAccent: '#198754',
    tableAccent: '#fd7e14',
    calloutAccent: '#dc3545',
    quoteAccent: '#6f42c1',
    pollAccent: '#20c997',
    citationAccent: '#adb5bd',
    numberCardAccent: '#0dcaf0',
    dividerAccent: '#6c757d'
  },
  preview: {
    previewBg: '#212529',
    previewCardBg: '#343a40',
    previewBorder: '#495057',
    previewHeaderBg: '#343a40',
    previewFooterBg: '#343a40',
    previewScrollbar: '#495057',
    previewScrollbarHover: '#6c757d'
  },
  palette: {
    paletteBg: '#343a40',
    paletteCardBg: '#495057',
    paletteCardHover: '#6c757d',
    paletteBorder: '#495057',
    paletteHeaderBg: '#343a40',
    categoryText: '#adb5bd',
    blockTitleText: '#f8f9fa',
    blockDescText: '#ced4da'
  }
};

export const DEFAULT_THEMES: EditorTheme[] = [LIGHT_THEME, DARK_THEME];

export const DEFAULT_THEME_ID = 'light';
