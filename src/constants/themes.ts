
// ABOUTME: Default theme definitions and presets for the native editor
// Provides light and dark theme variants with comprehensive color coverage

import { EditorTheme } from '@/types/theme';

export const LIGHT_THEME: EditorTheme = {
  name: 'Light Theme',
  id: 'light',
  editor: {
    // Background Colors
    primaryBg: '#ffffff',
    secondaryBg: '#f8f9fa',
    tertiaryBg: '#f1f3f4',
    surfaceBg: '#ffffff',
    cardBg: '#ffffff',
    hoverBg: '#f5f6f7',
    activeBg: '#e8eaed',
    selectedBg: '#e8f0fe',
    
    // Border Colors
    primaryBorder: '#e1e4e8',
    secondaryBorder: '#d0d7de',
    focusBorder: '#0969da',
    activeBorder: '#fd7e14',
    
    // Text Colors
    primaryText: '#24292f',
    secondaryText: '#57606a',
    mutedText: '#8b949e',
    accentText: '#0969da',
    linkText: '#0969da',
    
    // Status Colors
    successColor: '#1a7f37',
    warningColor: '#d1242f',
    errorColor: '#cf222e',
    infoColor: '#0969da',
    
    // Interactive Colors
    buttonPrimary: '#24292f',
    buttonPrimaryHover: '#1c2128',
    buttonSecondary: '#f6f8fa',
    buttonSecondaryHover: '#f3f4f6',
    buttonGhost: 'transparent',
    buttonGhostHover: '#f5f6f7'
  },
  blocks: {
    // Block-specific colors
    blockBackground: '#ffffff',
    blockBorder: '#e1e4e8',
    blockHover: '#f5f6f7',
    blockSelected: '#e8f0fe',
    blockActive: '#dbeafe',
    
    // Block type indicators
    snapshotCardAccent: '#0969da',
    headingAccent: '#6f42c1',
    paragraphAccent: '#24292f',
    figureAccent: '#1a7f37',
    tableAccent: '#bf8700',
    calloutAccent: '#d1242f',
    quoteAccent: '#8250df',
    pollAccent: '#1f883d',
    citationAccent: '#656d76',
    numberCardAccent: '#0969da',
    dividerAccent: '#d0d7de'
  },
  preview: {
    previewBg: '#ffffff',
    previewCardBg: '#ffffff',
    previewBorder: '#e1e4e8',
    previewHeaderBg: '#f6f8fa',
    previewFooterBg: '#f6f8fa',
    previewScrollbar: '#d0d7de',
    previewScrollbarHover: '#8b949e'
  },
  palette: {
    paletteBg: '#f6f8fa',
    paletteCardBg: '#ffffff',
    paletteCardHover: '#f5f6f7',
    paletteBorder: '#e1e4e8',
    paletteHeaderBg: '#f6f8fa',
    categoryText: '#656d76',
    blockTitleText: '#24292f',
    blockDescText: '#8b949e'
  }
};

export const DARK_THEME: EditorTheme = {
  name: 'Dark Theme',
  id: 'dark',
  editor: {
    // Background Colors
    primaryBg: '#0d1117',
    secondaryBg: '#161b22',
    tertiaryBg: '#21262d',
    surfaceBg: '#0d1117',
    cardBg: '#161b22',
    hoverBg: '#21262d',
    activeBg: '#30363d',
    selectedBg: '#1f2937',
    
    // Border Colors
    primaryBorder: '#30363d',
    secondaryBorder: '#21262d',
    focusBorder: '#2f81f7',
    activeBorder: '#fd7e14',
    
    // Text Colors
    primaryText: '#f0f6fc',
    secondaryText: '#8b949e',
    mutedText: '#6e7681',
    accentText: '#2f81f7',
    linkText: '#58a6ff',
    
    // Status Colors
    successColor: '#3fb950',
    warningColor: '#d29922',
    errorColor: '#f85149',
    infoColor: '#2f81f7',
    
    // Interactive Colors
    buttonPrimary: '#f0f6fc',
    buttonPrimaryHover: '#e6edf3',
    buttonSecondary: '#21262d',
    buttonSecondaryHover: '#30363d',
    buttonGhost: 'transparent',
    buttonGhostHover: '#21262d'
  },
  blocks: {
    // Block-specific colors
    blockBackground: '#161b22',
    blockBorder: '#30363d',
    blockHover: '#21262d',
    blockSelected: '#1f2937',
    blockActive: '#1e293b',
    
    // Block type indicators
    snapshotCardAccent: '#2f81f7',
    headingAccent: '#a5a5f0',
    paragraphAccent: '#f0f6fc',
    figureAccent: '#3fb950',
    tableAccent: '#d29922',
    calloutAccent: '#f85149',
    quoteAccent: '#a5a5f0',
    pollAccent: '#3fb950',
    citationAccent: '#8b949e',
    numberCardAccent: '#2f81f7',
    dividerAccent: '#30363d'
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
    blockDescText: '#6e7681'
  }
};

export const DEFAULT_THEMES: EditorTheme[] = [LIGHT_THEME, DARK_THEME];

export const DEFAULT_THEME_ID = 'light';
