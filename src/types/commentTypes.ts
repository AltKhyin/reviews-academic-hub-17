
import { UserProfile } from "./issue";

// Base comment interface without recursive types
export interface BaseComment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  article_id?: string | null;
  issue_id?: string | null;
  post_id?: string | null;
  parent_id?: string | null;
  score: number;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  userVote?: 1 | -1 | 0;
}

// Comment with optional replies property for the hierarchy
export interface Comment extends BaseComment {
  replies?: Comment[];
}

// Comment vote interface
export interface CommentVote {
  user_id: string;
  comment_id: string;
  value: 1 | -1;
}

export type EntityType = 'article' | 'issue' | 'post';

export interface CommentQueryResponse {
  comments: BaseComment[];
  userVotes: CommentVote[];
}
