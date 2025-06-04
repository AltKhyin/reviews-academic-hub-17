
// ABOUTME: Utility functions for layout customization system
// Handles conversion between config objects and Tailwind CSS classes

import { SpacingConfig, SizeConfig, TailwindSpacing, TailwindMaxWidth, TailwindWidth } from '@/types/layout';

/**
 * Converts spacing config to Tailwind padding classes
 */
export const spacingToPaddingClasses = (spacing: SpacingConfig): string => {
  const classes: string[] = [];
  
  if (spacing.top > 0) classes.push(`pt-${spacing.top}`);
  if (spacing.right > 0) classes.push(`pr-${spacing.right}`);
  if (spacing.bottom > 0) classes.push(`pb-${spacing.bottom}`);
  if (spacing.left > 0) classes.push(`pl-${spacing.left}`);
  
  return classes.join(' ');
};

/**
 * Converts spacing config to Tailwind margin classes
 */
export const spacingToMarginClasses = (spacing: SpacingConfig): string => {
  const classes: string[] = [];
  
  if (spacing.top > 0) classes.push(`mt-${spacing.top}`);
  if (spacing.right > 0) classes.push(`mr-${spacing.right}`);
  if (spacing.bottom > 0) classes.push(`mb-${spacing.bottom}`);
  if (spacing.left > 0) classes.push(`ml-${spacing.left}`);
  
  return classes.join(' ');
};

/**
 * Converts size config to Tailwind size classes
 */
export const sizeToClasses = (size: SizeConfig): string => {
  return `${size.maxWidth} ${size.width}`;
};

/**
 * Generates complete Tailwind class string for a section
 */
export const generateSectionClasses = (
  padding: SpacingConfig,
  margin: SpacingConfig,
  size: SizeConfig,
  additionalClasses: string = ''
): string => {
  const paddingClasses = spacingToPaddingClasses(padding);
  const marginClasses = spacingToMarginClasses(margin);
  const sizeClasses = sizeToClasses(size);
  
  return [paddingClasses, marginClasses, sizeClasses, additionalClasses]
    .filter(Boolean)
    .join(' ')
    .trim();
};

/**
 * Validates Tailwind spacing value
 */
export const isValidTailwindSpacing = (value: number): value is number => {
  const validSpacings = [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 
    11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 52, 
    56, 60, 64, 72, 80, 96
  ];
  return validSpacings.includes(value);
};

/**
 * Validates Tailwind max-width class
 */
export const isValidTailwindMaxWidth = (value: string): value is TailwindMaxWidth => {
  const validMaxWidths = [
    'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl',
    'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full', 'max-w-screen-sm',
    'max-w-screen-md', 'max-w-screen-lg', 'max-w-screen-xl', 'max-w-screen-2xl'
  ];
  return validMaxWidths.includes(value as TailwindMaxWidth);
};

/**
 * Validates Tailwind width class
 */
export const isValidTailwindWidth = (value: string): value is TailwindWidth => {
  const validWidths = [
    'w-auto', 'w-full', 'w-screen', 'w-min', 'w-max', 'w-fit',
    'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5'
  ];
  return validWidths.includes(value as TailwindWidth);
};

/**
 * Clamps spacing value to valid Tailwind range
 */
export const clampSpacingValue = (value: number): number => {
  return Math.max(0, Math.min(96, value));
};

/**
 * Parses Tailwind spacing class to numeric value
 */
export const parseTailwindSpacing = (className: string): number => {
  const match = className.match(/^(p|m)[trblxy]?-(\d+(?:\.\d+)?)$/);
  return match ? parseFloat(match[2]) : 0;
};

/**
 * Creates a CSS-in-JS style object from layout config (for dynamic styles)
 */
export const configToInlineStyles = (
  padding: SpacingConfig,
  margin: SpacingConfig
): React.CSSProperties => {
  return {
    paddingTop: `${padding.top * 0.25}rem`,
    paddingRight: `${padding.right * 0.25}rem`,
    paddingBottom: `${padding.bottom * 0.25}rem`,
    paddingLeft: `${padding.left * 0.25}rem`,
    marginTop: `${margin.top * 0.25}rem`,
    marginRight: `${margin.right * 0.25}rem`,
    marginBottom: `${margin.bottom * 0.25}rem`,
    marginLeft: `${margin.left * 0.25}rem`,
  };
};
