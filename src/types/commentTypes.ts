
// Comment types
export interface BaseComment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  article_id?: string;
  issue_id?: string;
  post_id?: string;
  score: number;
  userVote?: 1 | 0 | -1;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Comment extends BaseComment {
  replies?: Comment[];
}

export type EntityType = 'article' | 'issue' | 'post';

export interface CommentVote {
  value: -1 | 0 | 1;
  user_id: string;
  comment_id: string;
}
