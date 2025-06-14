
// ABOUTME: Utility functions for converting spacing metadata to CSS styles
// Handles margin and padding conversion with fallback defaults - UPDATED: Reduced spacing by 50%

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
 * Gets default spacing for a block type - UPDATED: All values reduced by 50%
 */
export const getDefaultSpacing = (blockType: string): BlockSpacing => {
  switch (blockType) {
    case 'heading':
      return {
        margin: { top: 12, bottom: 8 }  // Reduced from 24/16 to 12/8
      };
    case 'paragraph':
      return {
        margin: { top: 4, bottom: 4 }  // Reduced from 8/8 to 4/4
      };
    case 'figure':
      return {
        margin: { top: 8, bottom: 8 }  // Reduced from 16/16 to 8/8
      };
    case 'table':
      return {
        margin: { top: 8, bottom: 8 }  // Reduced from 16/16 to 8/8
      };
    case 'callout':
      return {
        margin: { top: 8, bottom: 8 },  // Reduced from 16/16 to 8/8
        padding: { top: 6, right: 8, bottom: 6, left: 8 }  // Reduced from 12/16/12/16 to 6/8/6/8
      };
    case 'divider':
      return {
        margin: { top: 12, bottom: 12 }  // Reduced from 24/24 to 12/12
      };
    default:
      return {
        margin: { top: 8, bottom: 8 }  // Reduced from 16/16 to 8/8
      };
  }
};
