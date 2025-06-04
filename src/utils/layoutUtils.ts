
// ABOUTME: Utility functions for generating Tailwind CSS classes from layout configurations
// Converts spacing and sizing configs into proper CSS class strings

import { SpacingConfig, SizeConfig } from '@/types/layout';

/**
 * Generates Tailwind padding classes from SpacingConfig
 */
export const generatePaddingClasses = (padding: SpacingConfig): string => {
  const classes: string[] = [];
  
  if (padding.top > 0) classes.push(`pt-${padding.top}`);
  if (padding.right > 0) classes.push(`pr-${padding.right}`);
  if (padding.bottom > 0) classes.push(`pb-${padding.bottom}`);
  if (padding.left > 0) classes.push(`pl-${padding.left}`);
  
  return classes.join(' ');
};

/**
 * Generates Tailwind margin classes from SpacingConfig
 */
export const generateMarginClasses = (margin: SpacingConfig): string => {
  const classes: string[] = [];
  
  if (margin.top > 0) classes.push(`mt-${margin.top}`);
  if (margin.right > 0) classes.push(`mr-${margin.right}`);
  if (margin.bottom > 0) classes.push(`mb-${margin.bottom}`);
  if (margin.left > 0) classes.push(`ml-${margin.left}`);
  
  return classes.join(' ');
};

/**
 * Generates Tailwind size classes from SizeConfig
 */
export const generateSizeClasses = (size: SizeConfig): string => {
  return `${size.maxWidth} ${size.width}`.trim();
};

/**
 * Generates complete section classes by combining all layout configs
 */
export const generateSectionClasses = (
  padding: SpacingConfig,
  margin: SpacingConfig,
  size: SizeConfig,
  additionalClasses: string = ''
): string => {
  const paddingClasses = generatePaddingClasses(padding);
  const marginClasses = generateMarginClasses(margin);
  const sizeClasses = generateSizeClasses(size);
  
  return [paddingClasses, marginClasses, sizeClasses, additionalClasses]
    .filter(cls => cls.trim().length > 0)
    .join(' ')
    .trim();
};

/**
 * Validates that spacing values are within acceptable range
 */
export const validateSpacing = (spacing: SpacingConfig): boolean => {
  const values = [spacing.top, spacing.right, spacing.bottom, spacing.left];
  return values.every(val => val >= 0 && val <= 96);
};

/**
 * Creates a responsive breakpoint class string
 */
export const generateResponsiveClasses = (
  baseClasses: string,
  smClasses?: string,
  mdClasses?: string,
  lgClasses?: string,
  xlClasses?: string
): string => {
  const responsive: string[] = [baseClasses];
  
  if (smClasses) responsive.push(`sm:${smClasses}`);
  if (mdClasses) responsive.push(`md:${mdClasses}`);
  if (lgClasses) responsive.push(`lg:${lgClasses}`);
  if (xlClasses) responsive.push(`xl:${xlClasses}`);
  
  return responsive.join(' ');
};

/**
 * Converts numeric spacing to Tailwind class suffix
 */
export const spacingToTailwind = (value: number): string => {
  // Handle decimal values like 0.5, 1.5, 2.5, 3.5
  if (value === 0.5) return '0.5';
  if (value === 1.5) return '1.5';
  if (value === 2.5) return '2.5';
  if (value === 3.5) return '3.5';
  
  return value.toString();
};

/**
 * Merges multiple spacing configurations with priority
 */
export const mergeSpacingConfigs = (
  base: SpacingConfig,
  override: Partial<SpacingConfig>
): SpacingConfig => {
  return {
    top: override.top ?? base.top,
    right: override.right ?? base.right,
    bottom: override.bottom ?? base.bottom,
    left: override.left ?? base.left,
  };
};

/**
 * Creates a deep copy of spacing configuration
 */
export const cloneSpacingConfig = (spacing: SpacingConfig): SpacingConfig => {
  return {
    top: spacing.top,
    right: spacing.right,
    bottom: spacing.bottom,
    left: spacing.left,
  };
};

/**
 * Checks if two spacing configurations are equal
 */
export const isSpacingEqual = (a: SpacingConfig, b: SpacingConfig): boolean => {
  return (
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.left === b.left
  );
};

/**
 * Gets the total horizontal spacing (left + right)
 */
export const getTotalHorizontalSpacing = (spacing: SpacingConfig): number => {
  return spacing.left + spacing.right;
};

/**
 * Gets the total vertical spacing (top + bottom)
 */
export const getTotalVerticalSpacing = (spacing: SpacingConfig): number => {
  return spacing.top + spacing.bottom;
};
