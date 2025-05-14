
// Re-export comment types
export * from './commentTypes';

export interface CommentVote {
  value: -1 | 0 | 1;
  user_id: string;
  comment_id: string;
}
