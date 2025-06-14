
// ABOUTME: Types for comments and related entities.

export type EntityType = 'issue' | 'post' | 'article';

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_avatar_url: string;
  score: number;
  userVote: 1 | -1 | 0;
  replies: Comment[];
  parent_id?: string;
}
