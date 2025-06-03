
export interface PostFlair {
  id: string;
  name: string;
  color: string;
}

export interface PollOption {
  id: string;
  text: string;
  position: number;
  votes: number;
}

export interface Poll {
  id: string;
  options: PollOption[];
  total_votes: number;
  user_vote: string | null;
}

export interface PostData {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  published: boolean;
  score: number;
  poll_id: string | null;
  pinned: boolean;
  pinned_at: string | null;
  pinned_by: string | null;
  issue_id: string | null;
  auto_generated: boolean;
  pin_duration_days: number | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  post_flairs: {
    id: string;
    name: string;
    color: string;
  } | null;
  poll: Poll | null;
  userVote?: number;
}

export interface CommunitySettings {
  id: string;
  header_image_url: string;
  theme_color: string;
  description: string;
  allow_polls: boolean;
  created_at: string;
  updated_at: string;
}

export interface IssueDiscussionSettings {
  id: string;
  issue_id: string;
  discussion_content: string | null;
  include_read_button: boolean;
  pin_duration_days: number;
  created_at: string;
  updated_at: string;
}
