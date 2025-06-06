
// ABOUTME: Utility functions for converting spacing metadata to CSS styles
// Handles margin and padding conversion with fallback defaults

import { BlockSpacing } from '@/types/review';

/**
 * Converts spacing metadata to CSS style object
 */
export const generateSpacingStyles = (spacing?: BlockSpacing): React.CSSProperties => {
  if (!spacing) return {};

  const styles: React.CSSProperties = {};

  // Handle margin
  if (spacing.margin) {
    const margin = spacing.margin;
    if (margin.top !== undefined) styles.marginTop = `${margin.top}px`;
    if (margin.right !== undefined) styles.marginRight = `${margin.right}px`;
    if (margin.bottom !== undefined) styles.marginBottom = `${margin.bottom}px`;
    if (margin.left !== undefined) styles.marginLeft = `${margin.left}px`;
  }

  // Handle padding
  if (spacing.padding) {
    const padding = spacing.padding;
    if (padding.top !== undefined) styles.paddingTop = `${padding.top}px`;
    if (padding.right !== undefined) styles.paddingRight = `${padding.right}px`;
    if (padding.bottom !== undefined) styles.paddingBottom = `${padding.bottom}px`;
    if (padding.left !== undefined) styles.paddingLeft = `${padding.left}px`;
  }

  return styles;
};

/**
 * Generates Tailwind CSS classes for spacing (fallback for older browsers)
 */
export const generateSpacingClasses = (spacing?: BlockSpacing): string => {
  if (!spacing) return '';

  const classes: string[] = [];

  // Convert margin values to Tailwind classes
  if (spacing.margin) {
    const margin = spacing.margin;
    
    // Check if all margins are the same for shorthand
    const allMarginsSame = margin.top === margin.right && 
                          margin.right === margin.bottom && 
                          margin.bottom === margin.left;
    
    if (allMarginsSame && margin.top !== undefined) {
      classes.push(`m-[${margin.top}px]`);
    } else {
      if (margin.top !== undefined) classes.push(`mt-[${margin.top}px]`);
      if (margin.right !== undefined) classes.push(`mr-[${margin.right}px]`);
      if (margin.bottom !== undefined) classes.push(`mb-[${margin.bottom}px]`);
      if (margin.left !== undefined) classes.push(`ml-[${margin.left}px]`);
    }
  }

  // Convert padding values to Tailwind classes
  if (spacing.padding) {
    const padding = spacing.padding;
    
    // Check if all paddings are the same for shorthand
    const allPaddingsSame = padding.top === padding.right && 
                           padding.right === padding.bottom && 
                           padding.bottom === padding.left;
    
    if (allPaddingsSame && padding.top !== undefined) {
      classes.push(`p-[${padding.top}px]`);
    } else {
      if (padding.top !== undefined) classes.push(`pt-[${padding.top}px]`);
      if (padding.right !== undefined) classes.push(`pr-[${padding.right}px]`);
      if (padding.bottom !== undefined) classes.push(`pb-[${padding.bottom}px]`);
      if (padding.left !== undefined) classes.push(`pl-[${padding.left}px]`);
    }
  }

  return classes.join(' ');
};

/**
 * Gets default spacing for a block type
 */
export const getDefaultSpacing = (blockType: string): BlockSpacing => {
  switch (blockType) {
    case 'heading':
      return {
        margin: { top: 24, bottom: 16 }
      };
    case 'paragraph':
      return {
        margin: { top: 8, bottom: 8 }
      };
    case 'figure':
      return {
        margin: { top: 16, bottom: 16 }
      };
    case 'table':
      return {
        margin: { top: 16, bottom: 16 }
      };
    case 'callout':
      return {
        margin: { top: 16, bottom: 16 },
        padding: { top: 12, right: 16, bottom: 12, left: 16 }
      };
    case 'divider':
      return {
        margin: { top: 24, bottom: 24 }
      };
    default:
      return {
        margin: { top: 16, bottom: 16 }
      };
  }
};
