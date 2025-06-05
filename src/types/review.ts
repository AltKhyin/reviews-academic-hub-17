
// ABOUTME: Review block types with enhanced layout metadata
// Core data structures for review content blocks

import { ExtendedLayoutMeta } from './grid';

export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'quote' 
  | 'code' 
  | 'divider'
  | 'figure'
  | 'callout'
  | 'table'
  | 'citation_list'
  | 'poll'
  | 'reviewer_quote'
  | 'snapshot_card'
  | 'number_card';

export interface ReviewBlockMeta {
  layout?: ExtendedLayoutMeta; // FIXED: Now uses the extended interface
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  spacing?: {
    margin?: number;
    padding?: number;
  };
  visibility?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
}

export interface ReviewBlock {
  id: number;
  type: BlockType;
  content: any;
  sort_index: number;
  visible: boolean;
  meta?: ReviewBlockMeta;
}

export interface ReviewBlockProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
}
