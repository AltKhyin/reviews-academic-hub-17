
// Re-export comment types
export * from './commentTypes';

export interface CommentVote {
  value: -1 | 0 | 1;
  user_id: string;
  comment_id: string;
}

// Define suggestion type with proper user profile structure
export interface Suggestion {
  id: string;
  title: string;
  description?: string;
  votes: number;
  created_at: string;
  user_id: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  hasVoted?: number; // -1, 0, or 1
}

export interface UserVote {
  id: string;
  user_id: string;
  suggestion_id: string;
  created_at: string;
  value?: number;
}
