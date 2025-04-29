
import { UserProfile } from "./issue";

export interface Comment {
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
  replies?: Comment[];
}

export interface CommentVote {
  user_id: string;
  comment_id: string;
  value: 1 | -1;
}

export type EntityType = 'article' | 'issue' | 'post';

export interface CommentQueryResponse {
  comments: any[];
  userVotes: CommentVote[];
}
