
// ABOUTME: Utility functions for generating Tailwind classes from layout configurations
// Converts spacing and size configs into proper CSS class strings

import { SpacingConfig, SizeConfig } from '@/types/layout';

export const generateSpacingClasses = (
  padding: SpacingConfig,
  margin: SpacingConfig
): string => {
  const classes: string[] = [];

  // Generate padding classes
  if (padding.top > 0) classes.push(`pt-${padding.top}`);
  if (padding.right > 0) classes.push(`pr-${padding.right}`);
  if (padding.bottom > 0) classes.push(`pb-${padding.bottom}`);
  if (padding.left > 0) classes.push(`pl-${padding.left}`);

  // Generate margin classes
  if (margin.top > 0) classes.push(`mt-${margin.top}`);
  if (margin.right > 0) classes.push(`mr-${margin.right}`);
  if (margin.bottom > 0) classes.push(`mb-${margin.bottom}`);
  if (margin.left > 0) classes.push(`ml-${margin.left}`);

  return classes.join(' ');
};

export const generateSizeClasses = (size: SizeConfig): string => {
  const classes: string[] = [];

  // Add max-width class
  if (size.maxWidth) {
    classes.push(size.maxWidth);
  }

  // Add width class
  if (size.width) {
    classes.push(size.width);
  }

  return classes.join(' ');
};

export const generateSectionClasses = (
  padding: SpacingConfig,
  margin: SpacingConfig,
  size: SizeConfig,
  additionalClasses: string = ''
): string => {
  const spacingClasses = generateSpacingClasses(padding, margin);
  const sizeClasses = generateSizeClasses(size);

  // Combine all classes and remove duplicates
  const allClasses = [spacingClasses, sizeClasses, additionalClasses]
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter(Boolean);

  // Remove duplicates while preserving order
  const uniqueClasses = Array.from(new Set(allClasses));

  return uniqueClasses.join(' ');
};

// Utility function to validate Tailwind spacing values
export const isValidSpacingValue = (value: any): boolean => {
  if (typeof value === 'number') {
    return value >= 0 && value <= 96;
  }
  
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= 0 && numValue <= 96;
  }
  
  return false;
};

// Utility function to sanitize spacing values
export const sanitizeSpacingValue = (value: any): number => {
  if (typeof value === 'number') {
    return Math.max(0, Math.min(96, Math.floor(value)));
  }
  
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return Math.max(0, Math.min(96, Math.floor(numValue)));
    }
  }
  
  return 0;
};
