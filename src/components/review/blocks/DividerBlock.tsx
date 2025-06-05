
// ABOUTME: Visual section divider for content organization
// Simple horizontal rule with optional styling

import React from 'react';
import { ReviewBlock } from '@/types/review';
import { cn } from '@/lib/utils';

interface DividerBlockProps {
  block: ReviewBlock;
  onInteraction?: (blockId: string, interactionType: string, data?: any) => void;
  onSectionView?: (blockId: string) => void;
  readonly?: boolean;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  onInteraction,
  onSectionView,
  readonly
}) => {
  return (
    <hr 
      className={cn(
        "divider-block my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent",
        block.meta?.styles?.className
      )}
      style={block.meta?.styles?.inline}
    />
  );
};
