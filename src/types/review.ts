
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

// Enhanced alignment types with vertical support
export interface BlockAlignment {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'center' | 'bottom';
}

export interface ReviewBlockMeta {
  layout?: ExtendedLayoutMeta;
  alignment?: BlockAlignment;
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
  styles?: {
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;
  };
}

export interface ReviewBlock {
  id: number;
  type: BlockType;
  content: any; // This is the correct property name, not 'payload'
  sort_index: number;
  visible: boolean;
  meta?: ReviewBlockMeta;
}

export interface ReviewBlockProps {
  block: ReviewBlock;
  onUpdate: (updates: Partial<ReviewBlock>) => void;
  readonly?: boolean;
}

// Enhanced Issue type for compatibility
export interface EnhancedIssue {
  id: string;
  title: string;
  description?: string;
  authors?: string;
  specialty: string;
  year?: number;
  population?: string;
  review_type: string;
  article_pdf_url?: string;
  pdf_url?: string;
}

// Enhanced Snapshot card content type
export interface SnapshotCardContent {
  title: string;
  subtitle?: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  evidence_level?: 'high' | 'moderate' | 'low' | 'very_low';
  recommendation_strength?: 'strong' | 'conditional' | 'expert_opinion';
  population?: string;
  intervention?: string;
  comparison?: string;
  outcome?: string;
  design?: string;
  key_findings?: string[];
}

// Legacy payload type for compatibility - DEPRECATED
export interface SnapshotCardPayload extends SnapshotCardContent {}
