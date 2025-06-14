
// ABOUTME: Supabase generated types placeholder

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: { Row: any; Insert: any; Update: any; Relationships: [] };
      profiles: { Row: any; Insert: any; Update: any; Relationships: [] };
      comments: { Row: any; Insert: any; Update: any; Relationships: [] };
      issues: { Row: any; Insert: any; Update: any; Relationships: [] };
      posts: { Row: any; Insert: any; Update: any; Relationships: [] };
      tags: { Row: any; Insert: any; Update: any; Relationships: [] };
      upcoming_releases: { Row: any; Insert: any; Update: any; Relationships: [] };
      post_polls: { Row: any; Insert: any; Update: any; Relationships: [] };
      polls: { Row: any; Insert: any; Update: any; Relationships: [] };
      poll_options: { Row: any; Insert: any; Update: any; Relationships: [] };
      post_flairs: { Row: any; Insert: any; Update: any; Relationships: [] };
      review_blocks: { Row: any; Insert: any; Update: any; Relationships: [] };
      content_suggestions: { Row: any; Insert: any; Update: any; Relationships: [] };
      user_votes: { Row: any; Insert: any; Update: any; Relationships: [] };
    }
    Views: {
      online_users: { Row: any; Relationships: [] };
      comments_highlight: { Row: any; Relationships: [] };
      mv_published_issues_archive: { Row: any; Relationships: [] };
      threads_top: { Row: any; Relationships: [] };
      mv_community_stats: { Row: any; Relationships: [] };
    }
    Functions: { [key: string]: any }
    Enums: { [key: string]: any }
    CompositeTypes: { [key: string]: any }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
