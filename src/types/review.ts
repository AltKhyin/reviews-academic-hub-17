
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
    className?: string;
    inline?: React.CSSProperties;
  };
  conditions?: {
    [key: string]: any;
  };
  analytics?: {
    track_views?: boolean;
    track_interactions?: boolean;
  };
}

export interface ReviewBlock {
  id: number;
  type: BlockType;
  content: any; // This is the correct property name, not 'payload'
  sort_index: number;
  visible: boolean;
  meta?: ReviewBlockMeta;
  issue_id?: string;
  created_at?: string;
  updated_at?: string;
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
  published?: boolean;
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

// Block content/payload type (deprecated, use content directly)
export type BlockPayload = any;
export type BlockContent = any;

// Table of Contents type
export interface TableOfContents {
  sections: Array<{
    id: string;
    title: string;
    level: number;
    children?: TableOfContents['sections'];
  }>;
}

// Review Analytics types
export interface ReviewAnalytics {
  id: string;
  issue_id?: string;
  user_id?: string;
  event_type: AnalyticsEventType;
  event_data?: any;
  scroll_depth?: number;
  time_spent?: number;
  session_id?: string;
  referrer?: string;
  device_type?: string;
  created_at?: string;
}

export type AnalyticsEventType = 
  | 'page_view'
  | 'block_interaction' 
  | 'scroll'
  | 'click'
  | 'download'
  | 'bookmark'
  | 'share'
  | 'review_opened'
  | 'section_viewed'
  | 'review_completed'
  | 'view_mode_changed'
  | 'poll_voted';

// Review Poll types
export interface ReviewPoll {
  id: string;
  issue_id?: string;
  block_id?: number;
  question: string;
  options: string[] | Array<{id: string; text: string; votes: number}>;
  poll_type?: 'single_choice' | 'multiple_choice';
  votes?: number[];
  total_votes?: number;
  opens_at?: string;
  closes_at?: string;
  created_at?: string;
}
