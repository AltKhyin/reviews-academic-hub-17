
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

export interface SidebarSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
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
}

export interface SiteStats {
  totalUsers: number;
  onlineUsers: number;
}
