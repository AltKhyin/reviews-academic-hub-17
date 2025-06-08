
// ABOUTME: Type definitions for the new home page system
export interface ReviewerNote {
  id: string;
  admin_id: string;
  message: string;
  avatar_url?: string;
  display_name: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeSectionConfig {
  visible: boolean;
  order: number;
  [key: string]: any;
}

export interface HomeSettings {
  sections: {
    reviewer_notes: HomeSectionConfig;
    featured_carousel: HomeSectionConfig;
    recent_issues: HomeSectionConfig & { days_for_new_badge: number };
    popular_issues: HomeSectionConfig & { period: string };
    recommended_issues: HomeSectionConfig;
    upcoming_releases: HomeSectionConfig;
  };
  recent_issues: {
    days_for_new_badge: number;
    max_items: number;
  };
  popular_issues: {
    period: string;
    max_items: number;
  };
  recommended_issues: {
    max_items: number;
  };
}

export interface PopularIssue {
  id: string;
  title: string;
  cover_image_url?: string;
  specialty: string;
  published_at: string;
  view_count: number;
}

export interface IssueView {
  id: string;
  issue_id: string;
  user_id?: string;
  session_id?: string;
  viewed_at: string;
  ip_address?: string;
  user_agent?: string;
}
