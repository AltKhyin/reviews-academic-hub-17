
// ABOUTME: Utilities for handling block spacing and metadata.
import type { CSSProperties } from 'react';
import { BlockType, SpacingConfig } from '@/types/review';

// Default spacing values for different block types
const defaultSpacings: { [key in BlockType]?: SpacingConfig } = {
  heading: { paddingTop: '24px', paddingBottom: '8px' },
  paragraph: { paddingTop: '8px', paddingBottom: '8px' },
  list: { paddingTop: '8px', paddingBottom: '8px' },
  quote: { paddingTop: '16px', paddingBottom: '16px' },
  divider: { paddingTop: '16px', paddingBottom: '16px' },
};

export const getDefaultSpacing = (type: BlockType): SpacingConfig => {
  return defaultSpacings[type] || {
    paddingTop: '12px',
    paddingBottom: '12px',
  };
};

// Generates CSS-in-JS style object from a spacing configuration
export const generateSpacingStyles = (spacing: SpacingConfig | undefined): CSSProperties => {
  if (!spacing) {
    return {};
  }
  
  const styles: CSSProperties = {};
  if (spacing.paddingTop) styles.paddingTop = spacing.paddingTop;
  if (spacing.paddingBottom) styles.paddingBottom = spacing.paddingBottom;
  if (spacing.paddingLeft) styles.paddingLeft = spacing.paddingLeft;
  if (spacing.paddingRight) styles.paddingRight = spacing.paddingRight;
  if (spacing.marginTop) styles.marginTop = spacing.marginTop;
  if (spacing.marginBottom) styles.marginBottom = spacing.marginBottom;
  if (spacing.marginLeft) styles.marginLeft = spacing.marginLeft;
  if (spacing.marginRight) styles.marginRight = spacing.marginRight;
  
  return styles;
};
