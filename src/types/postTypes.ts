
// ABOUTME: Types for community posts

export interface PostData {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  content: any; // Can be complex JSON
  image_url?: string;
  issue_id?: string;
  flair_id?: string;
  poll_id?: string;
  is_pinned: boolean;
  is_closed: boolean;
  // from profiles
  author_full_name?: string;
  author_avatar_url?: string;
  // from post_votes
  likes: number;
  user_vote?: 1 | -1 | 0;
  // from comments
  comments_count: number;
  // from post_bookmarks
  is_bookmarked?: boolean;
  // from post_follows
  is_following?: boolean;
  // from post_flairs
  flair_text?: string;
  flair_color?: string;
  flair_background_color?: string;
  // from issues
  issue_title?: string;
  issue_specialty?: string;
  view_count: number;
  reply_count: number;
  repost_count: number;
  tags: string[];
}
