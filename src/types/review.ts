
// ABOUTME: Enhanced types for review functionality with native content support
// Includes comprehensive types for blocks, polls, analytics and enhanced issue data

export interface ReviewBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'diagram' | 'poll' | 'table' | 'grid' | 'grid_2d' | 'callout' | 'separator' | 'code';
  content: any;
  sort_index: number;
  visible: boolean;
  meta?: {
    grid_columns?: number;
    grid_rows?: number;
    callout_type?: 'info' | 'warning' | 'success' | 'error';
    code_language?: string;
    [key: string]: any;
  };
  issue_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewPoll {
  id: string;
  question: string;
  options: string[];
  poll_type: 'single_choice' | 'multiple_choice';
  opens_at?: string;
  closes_at?: string;
  votes: any[];
  total_votes: number;
  issue_id?: string;
  block_id?: string;
}

export interface ReviewAnalytics {
  id: string;
  issue_id: string;
  user_id?: string;
  event_type: string;
  event_data?: any;
  scroll_depth?: number;
  time_spent?: number;
  device_type?: string;
  referrer?: string;
  session_id?: string;
  created_at: string;
}

export interface TableOfContents {
  sections: Array<{
    id: string;
    title: string;
    level: number;
    block_id?: string;
  }>;
}

// Enhanced issue type with all review-specific fields
export interface EnhancedIssue {
  id: string;
  title: string;
  description?: string;
  authors?: string;
  specialty: string;
  edition?: string; // Added edition field
  year?: number;
  population?: string;
  review_type: 'pdf' | 'native' | 'hybrid';
  article_pdf_url?: string;
  pdf_url?: string;
}

export interface ReviewData {
  issue: EnhancedIssue;
  blocks: ReviewBlock[];
  polls: ReviewPoll[];
  tableOfContents?: TableOfContents;
}
