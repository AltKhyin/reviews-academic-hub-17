
// ABOUTME: Unified sidebar types with complete configuration support
// Defines all types needed for sidebar configuration and rendering integration

export interface OnlineUser {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  last_active: string;
}

export interface CommentHighlight {
  id: string;
  body: string;
  votes: number;
  author_avatar: string | null;
  author_name: string | null;
  thread_id: string;
  created_at: string;
}

export interface TopThread {
  thread_type: string;
  id: string;
  title: string;
  comments: number;
  votes: number;
  created_at: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  closes_at: string;
  created_at: string;
  active: boolean;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
}

export interface Bookmark {
  label: string;
  url: string;
  icon: string;
}

export interface ChangelogEntry {
  date: string;
  text: string;
}

// Unified section IDs - matches both config and rendering
export type SidebarSectionId = 
  | 'header'
  | 'users' 
  | 'comments'
  | 'threads'
  | 'poll'
  | 'countdown'
  | 'bookmarks'
  | 'rules'
  | 'changelog';

export interface SidebarSection {
  id: SidebarSectionId;
  name: string;
  enabled: boolean;
  order: number;
  // Section-specific configuration
  config?: {
    // Header config
    showStats?: boolean;
    showOnlineCount?: boolean;
    
    // Users config
    maxAvatars?: number;
    avatarSize?: 'sm' | 'md' | 'lg';
    showOnlineStatus?: boolean;
    showTooltips?: boolean;
    
    // Comments config
    maxComments?: number;
    rotationSpeed?: number;
    minVotes?: number;
    autoRotate?: boolean;
    showVoteCount?: boolean;
    
    // Threads config
    maxThreads?: number;
    sortBy?: 'votes' | 'comments' | 'recent' | 'views';
    timeRange?: 'day' | 'week' | 'month' | 'all';
    threadTypes?: string[];
    
    // Poll config
    allowMultiple?: boolean;
    showResults?: boolean;
    anonymousVoting?: boolean;
    
    // Countdown config
    timezone?: string;
    showProgress?: boolean;
    showDaysOnly?: boolean;
    urgentAlert?: boolean;
    
    // Visual config
    cardSpacing?: number;
    fontSize?: 'sm' | 'md' | 'lg';
    
    // Advanced config
    refreshInterval?: number;
    enableCaching?: boolean;
    debugMode?: boolean;
    preloadData?: boolean;
  };
}

export interface SidebarConfig {
  tagline: string;
  nextReviewTs: string;
  bookmarks: Bookmark[];
  rules: string[];
  changelog: {
    show: boolean;
    entries: ChangelogEntry[];
  };
  sections: SidebarSection[];
  // Global visual settings
  visual?: {
    width?: number;
    colorTheme?: 'default' | 'dark' | 'light' | 'blue' | 'green';
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface SiteStats {
  totalUsers: number;
  onlineUsers: number;
}

// Component mapping for rendering
export interface SidebarComponentMapping {
  [key: string]: React.ComponentType<any>;
}
