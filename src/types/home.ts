
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

// More specific section configs that extend the base
export interface RecentIssuesSectionConfig extends HomeSectionConfig {
  days_for_new_badge: number;
}

export interface PopularIssuesSectionConfig extends HomeSectionConfig {
  period: string;
}

// Use a union type for sections instead of intersection types
export interface HomeSettings {
  sections: {
    reviewer_notes: HomeSectionConfig;
    featured_carousel: HomeSectionConfig;
    recent_issues: RecentIssuesSectionConfig;
    popular_issues: PopularIssuesSectionConfig;
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

// Lightweight Issue type for home page display
export interface HomeIssue {
  id: string;
  title: string;
  cover_image_url?: string;
  specialty: string;
  published_at: string;
  description?: string;
  authors?: string;
  score?: number;
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

// Type guard for HomeSettings
export function isHomeSettings(value: any): value is HomeSettings {
  return (
    value &&
    typeof value === 'object' &&
    value.sections &&
    typeof value.sections === 'object' &&
    value.recent_issues &&
    typeof value.recent_issues === 'object' &&
    value.popular_issues &&
    typeof value.popular_issues === 'object' &&
    value.recommended_issues &&
    typeof value.recommended_issues === 'object'
  );
}
