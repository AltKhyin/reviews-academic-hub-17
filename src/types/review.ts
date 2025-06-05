
// ABOUTME: Type definitions for the Native Review system
// Extends existing Issue type with new review capabilities

export type ReviewType = 'pdf' | 'native' | 'hybrid';

export type BlockType = 
  | 'snapshot_card'
  | 'heading'
  | 'paragraph'
  | 'figure'
  | 'table'
  | 'poll'
  | 'callout'
  | 'reviewer_quote'
  | 'divider'
  | 'number_card'
  | 'citation_list';

export interface ReviewBlock {
  id: number; // Changed from string to number to match database bigint
  issue_id: string;
  sort_index: number;
  type: BlockType;
  payload: BlockPayload;
  meta: BlockMeta;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockMeta {
  styles?: Record<string, any>;
  conditions?: Record<string, any>;
  analytics?: {
    track_views?: boolean;
    track_interactions?: boolean;
  };
}

export interface BlockPayload {
  [key: string]: any;
}

// Specific block payload types
export interface SnapshotCardPayload extends BlockPayload {
  population: string;
  intervention: string;
  comparison: string;
  outcome: string;
  design: string;
  key_findings: string[];
  evidence_level: 'high' | 'moderate' | 'low' | 'very_low';
  recommendation_strength: 'strong' | 'conditional' | 'expert_opinion';
}

export interface HeadingPayload extends BlockPayload {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
  anchor_id: string;
}

export interface ParagraphPayload extends BlockPayload {
  content: string; // Rich text HTML
  citations?: string[];
}

export interface FigurePayload extends BlockPayload {
  image_url: string;
  caption: string;
  alt_text: string;
  figure_number?: number;
  width?: number;
  height?: number;
}

export interface TablePayload extends BlockPayload {
  headers: string[];
  rows: string[][];
  caption?: string;
  table_number?: number;
  sortable?: boolean;
}

export interface CalloutPayload extends BlockPayload {
  type: 'info' | 'warning' | 'success' | 'error' | 'note';
  title?: string;
  content: string;
  icon?: string;
}

export interface NumberCardPayload extends BlockPayload {
  number: string;
  label: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
}

export interface ReviewerQuotePayload extends BlockPayload {
  quote: string;
  author: string;
  title?: string;
  institution?: string;
  avatar_url?: string;
}

export interface ReviewPoll {
  id: string;
  issue_id: string;
  block_id: number; // Changed from string to number
  question: string;
  options: PollOption[];
  poll_type: 'single_choice' | 'multiple_choice' | 'rating';
  opens_at: string;
  closes_at?: string;
  votes: number[];
  total_votes: number;
  created_at: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface ReviewAnalytics {
  id: string;
  issue_id: string;
  user_id?: string;
  session_id?: string;
  event_type: AnalyticsEventType;
  event_data?: Record<string, any>;
  scroll_depth?: number;
  time_spent?: number;
  referrer?: string;
  device_type?: string;
  created_at: string;
}

export type AnalyticsEventType = 
  | 'review_opened'
  | 'section_viewed'
  | 'review_completed'
  | 'poll_voted'
  | 'block_interacted'
  | 'pdf_opened'
  | 'view_mode_changed';

export interface TableOfContents {
  sections: TOCSection[];
}

export interface TOCSection {
  id: string;
  title: string;
  level: number;
  anchor: string;
  children?: TOCSection[];
}

// Enhanced Issue type that extends the existing one
export interface EnhancedIssue {
  // All existing fields from Issue type
  id: string;
  title: string;
  specialty: string;
  description?: string | null;
  pdf_url: string;
  article_pdf_url?: string | null;
  cover_image_url?: string | null;
  published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  featured?: boolean | null;
  score?: number | null;
  year?: string | null;
  design?: string | null;
  population?: string | null;
  authors?: string | null;
  real_title?: string | null;
  real_title_ptbr?: string | null;
  search_title?: string | null;
  search_description?: string | null;
  
  // New native review fields
  review_type: ReviewType;
  review_content?: ReviewBlock[];
  toc_data?: TableOfContents;
}

export type ViewMode = 'native' | 'pdf' | 'dual';

export interface ReviewViewerState {
  viewMode: ViewMode;
  progress: number;
  activeSection?: string;
  userVotes: Record<string, any>;
  analytics: {
    startTime: number;
    totalTime: number;
    sectionsViewed: string[];
  };
}
