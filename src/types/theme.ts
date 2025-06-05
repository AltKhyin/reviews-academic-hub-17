
// ABOUTME: Comprehensive theme type definitions for editor customization
// Provides granular control over every color in the native editor

export interface EditorColors {
  // Background Colors
  primaryBg: string;
  secondaryBg: string;
  tertiaryBg: string;
  surfaceBg: string;
  cardBg: string;
  hoverBg: string;
  activeBg: string;
  selectedBg: string;
  
  // Border Colors
  primaryBorder: string;
  secondaryBorder: string;
  focusBorder: string;
  activeBorder: string;
  
  // Text Colors
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  accentText: string;
  linkText: string;
  
  // Status Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  
  // Interactive Colors
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonGhost: string;
  buttonGhostHover: string;
}

export interface BlockColors {
  // Block-specific colors
  blockBackground: string;
  blockBorder: string;
  blockHover: string;
  blockSelected: string;
  blockActive: string;
  
  // Block type indicators
  snapshotCardAccent: string;
  headingAccent: string;
  paragraphAccent: string;
  figureAccent: string;
  tableAccent: string;
  calloutAccent: string;
  quoteAccent: string;
  pollAccent: string;
  citationAccent: string;
  numberCardAccent: string;
  dividerAccent: string;
}

export interface PreviewColors {
  previewBg: string;
  previewCardBg: string;
  previewBorder: string;
  previewHeaderBg: string;
  previewFooterBg: string;
  previewScrollbar: string;
  previewScrollbarHover: string;
}

export interface PaletteColors {
  paletteBg: string;
  paletteCardBg: string;
  paletteCardHover: string;
  paletteBorder: string;
  paletteHeaderBg: string;
  categoryText: string;
  blockTitleText: string;
  blockDescText: string;
}

export interface EditorTheme {
  name: string;
  id: string;
  editor: EditorColors;
  blocks: BlockColors;
  preview: PreviewColors;
  palette: PaletteColors;
}

export interface ThemeCustomization {
  theme: EditorTheme;
  customizations: Partial<EditorTheme>;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  currentTheme: EditorTheme;
  appliedTheme: EditorTheme;
  themeMode: ThemeMode;
  availableThemes: EditorTheme[];
  customizations: Partial<EditorTheme>;
  
  // Theme actions
  setTheme: (themeId: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  customizeColor: (path: string, value: string) => void;
  resetCustomizations: () => void;
  exportTheme: () => string;
  importTheme: (themeData: string) => void;
}
