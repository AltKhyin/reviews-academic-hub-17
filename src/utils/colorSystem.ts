
// ABOUTME: Centralized color system utility to prevent color drift and ensure consistency
// Provides validated color values and prevents blue-tinted colors from being used

export const APP_COLORS = {
  // Primary backgrounds - Pure grays without blue tint
  PRIMARY_BG: '#121212',
  SECONDARY_BG: '#1a1a1a',
  TERTIARY_BG: '#212121',
  QUATERNARY_BG: '#2a2a2a',
  
  // Text colors
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#d1d5db',
  TEXT_MUTED: '#9ca3af',
  TEXT_SUBTLE: '#6b7280',
  
  // Interactive colors
  HOVER_BG: '#2a2a2a',
  ACTIVE_BG: '#333333',
  
  // Accent colors
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  
  // Borders and separators
  BORDER_DEFAULT: '#2a2a2a',
  BORDER_SUBTLE: '#374151',
  
  // Transparent overlays
  OVERLAY_LIGHT: 'rgba(255, 255, 255, 0.1)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.3)',
} as const;

// CSS variable mappings for consistent usage
export const CSS_VARIABLES = {
  PRIMARY_BG: 'var(--editor-primary-bg)',
  SECONDARY_BG: 'var(--editor-secondary-bg)',
  TERTIARY_BG: 'var(--editor-tertiary-bg)',
  QUATERNARY_BG: 'var(--editor-quaternary-bg)',
  TEXT_PRIMARY: 'var(--editor-text-primary)',
  TEXT_SECONDARY: 'var(--editor-text-secondary)',
  TEXT_MUTED: 'var(--editor-text-muted)',
  TEXT_SUBTLE: 'var(--editor-text-subtle)',
  HOVER_BG: 'var(--editor-hover-bg)',
  ACTIVE_BG: 'var(--editor-active-bg)',
  SUCCESS: 'var(--editor-success-color)',
  BORDER_DEFAULT: 'var(--editor-quaternary-bg)',
} as const;

// Utility function to get consistent styles for common components
export const getConsistentStyles = () => ({
  card: {
    backgroundColor: CSS_VARIABLES.SECONDARY_BG,
    borderColor: CSS_VARIABLES.BORDER_DEFAULT,
    color: CSS_VARIABLES.TEXT_PRIMARY,
  },
  input: {
    backgroundColor: CSS_VARIABLES.TERTIARY_BG,
    borderColor: CSS_VARIABLES.BORDER_DEFAULT,
    color: CSS_VARIABLES.TEXT_PRIMARY,
  },
  button: {
    primary: {
      backgroundColor: APP_COLORS.INFO,
      color: CSS_VARIABLES.TEXT_PRIMARY,
      borderColor: APP_COLORS.INFO,
    },
    secondary: {
      backgroundColor: CSS_VARIABLES.TERTIARY_BG,
      color: CSS_VARIABLES.TEXT_PRIMARY,
      borderColor: CSS_VARIABLES.BORDER_DEFAULT,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: CSS_VARIABLES.TEXT_SECONDARY,
    },
  },
  toolbar: {
    backgroundColor: CSS_VARIABLES.SECONDARY_BG,
    borderColor: CSS_VARIABLES.BORDER_DEFAULT,
  },
  panel: {
    backgroundColor: CSS_VARIABLES.SECONDARY_BG,
    borderColor: CSS_VARIABLES.BORDER_DEFAULT,
  },
});

// Validation function to check for blue-tinted colors
export const validateColor = (color: string): boolean => {
  const blueTintedColors = [
    '#121417', '#161a1d', '#1d2125', // Known problematic colors
    // Add regex patterns for blue-tinted grays
  ];
  
  return !blueTintedColors.includes(color.toLowerCase());
};

// Function to replace blue-tinted colors with proper alternatives
export const fixBlueTintedColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#121417': APP_COLORS.PRIMARY_BG,
    '#161a1d': APP_COLORS.SECONDARY_BG,
    '#1d2125': APP_COLORS.TERTIARY_BG,
  };
  
  return colorMap[color.toLowerCase()] || color;
};

// React hook for consistent color usage
export const useAppColors = () => ({
  colors: APP_COLORS,
  cssVars: CSS_VARIABLES,
  styles: getConsistentStyles(),
  validateColor,
  fixColor: fixBlueTintedColor,
});
