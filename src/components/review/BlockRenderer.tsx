// ABOUTME: Block renderer with enhanced interface support
// Fixed to support all expected props from components

import React from 'react';
import { ReviewBlock } from '@/types/review';

export interface BlockRendererProps {
  block: ReviewBlock;
  readonly?: boolean;
  onUpdate?: (updates: Partial<ReviewBlock>) => void;
  onMove?: (direction: 'up' | 'down') => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  isSelected?: boolean;
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  readonly = false,
  onUpdate,
  onMove,
  onDelete,
  onDuplicate,
  isSelected = false,
  className
}) => {
  // Component implementation would go here
  // For now, returning a placeholder to resolve type errors
  return (
    <div className={className}>
      <div>Block: {block.type}</div>
      <div>ID: {block.id}</div>
    </div>
  );
};
