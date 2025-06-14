export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      article_reviews: {
        Row: {
          article_id: string
          comments: string | null
          created_at: string
          id: string
          reviewer_id: string
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
        }
        Insert: {
          article_id: string
          comments?: string | null
          created_at?: string
          id?: string
          reviewer_id: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Update: {
          article_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          reviewer_id?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_reviews_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          published_at: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments_highlight"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_votes: {
        Row: {
          comment_id: string
          user_id: string
          value: number
        }
        Insert: {
          comment_id: string
          user_id: string
          value: number
        }
        Update: {
          comment_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments_highlight"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string | null
          content: string
          created_at: string
          id: string
          issue_id: string | null
          parent_id: string | null
          post_id: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          content: string
          created_at?: string
          id?: string
          issue_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          content?: string
          created_at?: string
          id?: string
          issue_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments_highlight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "threads_top"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_settings: {
        Row: {
          allow_polls: boolean | null
          created_at: string | null
          description: string | null
          header_image_url: string | null
          id: string
          theme_color: string | null
          updated_at: string | null
        }
        Insert: {
          allow_polls?: boolean | null
          created_at?: string | null
          description?: string | null
          header_image_url?: string | null
          id?: string
          theme_color?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_polls?: boolean | null
          created_at?: string | null
          description?: string | null
          header_image_url?: string | null
          id?: string
          theme_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_suggestions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          upcoming_release_id: string | null
          user_id: string
          votes: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          upcoming_release_id?: string | null
          user_id: string
          votes?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          upcoming_release_id?: string | null
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_suggestions_upcoming_release_id_fkey"
            columns: ["upcoming_release_id"]
            isOneToOne: false
            referencedRelation: "upcoming_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      external_lectures: {
        Row: {
          created_at: string
          description: string | null
          external_url: string
          id: string
          issue_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url: string
          id?: string
          issue_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string
          id?: string
          issue_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_lectures_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_lectures_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_discussion_settings: {
        Row: {
          created_at: string | null
          discussion_content: string | null
          id: string
          include_read_button: boolean | null
          issue_id: string
          pin_duration_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discussion_content?: string | null
          id?: string
          include_read_button?: boolean | null
          issue_id: string
          pin_duration_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discussion_content?: string | null
          id?: string
          include_read_button?: boolean | null
          issue_id?: string
          pin_duration_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_discussion_settings_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: true
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_discussion_settings_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: true
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_views: {
        Row: {
          id: string
          ip_address: unknown | null
          issue_id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          issue_id: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          issue_id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_views_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_views_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          article_pdf_url: string | null
          authors: string | null
          backend_tags: Json | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          design: string | null
          edition: string | null
          featured: boolean | null
          id: string
          pdf_url: string
          population: string | null
          published: boolean
          published_at: string | null
          real_title: string | null
          real_title_ptbr: string | null
          review_content: Json | null
          review_type: string | null
          score: number | null
          search_description: string | null
          search_title: string | null
          specialty: string
          title: string
          toc_data: Json | null
          updated_at: string
          year: string | null
        }
        Insert: {
          article_pdf_url?: string | null
          authors?: string | null
          backend_tags?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          design?: string | null
          edition?: string | null
          featured?: boolean | null
          id?: string
          pdf_url: string
          population?: string | null
          published?: boolean
          published_at?: string | null
          real_title?: string | null
          real_title_ptbr?: string | null
          review_content?: Json | null
          review_type?: string | null
          score?: number | null
          search_description?: string | null
          search_title?: string | null
          specialty: string
          title: string
          toc_data?: Json | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          article_pdf_url?: string | null
          authors?: string | null
          backend_tags?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          design?: string | null
          edition?: string | null
          featured?: boolean | null
          id?: string
          pdf_url?: string
          population?: string | null
          published?: boolean
          published_at?: string | null
          real_title?: string | null
          real_title_ptbr?: string | null
          review_content?: Json | null
          review_type?: string | null
          score?: number | null
          search_description?: string | null
          search_title?: string | null
          specialty?: string
          title?: string
          toc_data?: Json | null
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          position: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          position: number
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          position?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_user_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_user_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          active: boolean | null
          closes_at: string
          created_at: string | null
          id: string
          options: Json
          question: string
          updated_at: string | null
          votes: Json | null
        }
        Insert: {
          active?: boolean | null
          closes_at: string
          created_at?: string | null
          id?: string
          options: Json
          question: string
          updated_at?: string | null
          votes?: Json | null
        }
        Update: {
          active?: boolean | null
          closes_at?: string
          created_at?: string | null
          id?: string
          options?: Json
          question?: string
          updated_at?: string | null
          votes?: Json | null
        }
        Relationships: []
      }
      post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "threads_top"
            referencedColumns: ["id"]
          },
        ]
      }
      post_flairs: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      post_polls: {
        Row: {
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "threads_top"
            referencedColumns: ["id"]
          },
        ]
      }
      post_votes: {
        Row: {
          post_id: string
          user_id: string
          value: number
        }
        Insert: {
          post_id: string
          user_id: string
          value: number
        }
        Update: {
          post_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "threads_top"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          auto_generated: boolean | null
          content: string | null
          created_at: string
          flair_id: string | null
          id: string
          image_url: string | null
          issue_id: string | null
          pin_duration_days: number | null
          pinned: boolean | null
          pinned_at: string | null
          pinned_by: string | null
          poll_id: string | null
          published: boolean
          score: number
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          content?: string | null
          created_at?: string
          flair_id?: string | null
          id?: string
          image_url?: string | null
          issue_id?: string | null
          pin_duration_days?: number | null
          pinned?: boolean | null
          pinned_at?: string | null
          pinned_by?: string | null
          poll_id?: string | null
          published?: boolean
          score?: number
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          content?: string | null
          created_at?: string
          flair_id?: string | null
          id?: string
          image_url?: string | null
          issue_id?: string | null
          pin_duration_days?: number | null
          pinned?: boolean | null
          pinned_at?: string | null
          pinned_by?: string | null
          poll_id?: string | null
          published?: boolean
          score?: number
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_flair_id_fkey"
            columns: ["flair_id"]
            isOneToOne: false
            referencedRelation: "post_flairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          institution: string | null
          role: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          institution?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          institution?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_analytics: {
        Row: {
          created_at: string | null
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          issue_id: string | null
          referrer: string | null
          scroll_depth: number | null
          session_id: string | null
          time_spent: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          issue_id?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_spent?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          issue_id?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_spent?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_analytics_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_analytics_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_blocks: {
        Row: {
          created_at: string | null
          id: number
          issue_id: string | null
          meta: Json | null
          payload: Json
          sort_index: number
          type: string
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          issue_id?: string | null
          meta?: Json | null
          payload: Json
          sort_index: number
          type: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: number
          issue_id?: string | null
          meta?: Json | null
          payload?: Json
          sort_index?: number
          type?: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "review_blocks_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_blocks_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
        ]
      }
      review_polls: {
        Row: {
          block_id: number | null
          closes_at: string | null
          created_at: string | null
          id: string
          issue_id: string | null
          opens_at: string | null
          options: Json
          poll_type: string | null
          question: string
          total_votes: number | null
          votes: Json | null
        }
        Insert: {
          block_id?: number | null
          closes_at?: string | null
          created_at?: string | null
          id?: string
          issue_id?: string | null
          opens_at?: string | null
          options: Json
          poll_type?: string | null
          question: string
          total_votes?: number | null
          votes?: Json | null
        }
        Update: {
          block_id?: number | null
          closes_at?: string | null
          created_at?: string | null
          id?: string
          issue_id?: string | null
          opens_at?: string | null
          options?: Json
          poll_type?: string | null
          question?: string
          total_votes?: number | null
          votes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "review_polls_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "review_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_polls_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_polls_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          reviewer_avatar: string | null
          reviewer_id: string
          reviewer_name: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          reviewer_avatar?: string | null
          reviewer_id: string
          reviewer_name: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          reviewer_avatar?: string | null
          reviewer_id?: string
          reviewer_name?: string
        }
        Relationships: []
      }
      reviewer_notes: {
        Row: {
          admin_id: string
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          message: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          message: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          message?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviewer_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_meta: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      tag_configurations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          tag_data: Json
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tag_data?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tag_data?: Json
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      upcoming_releases: {
        Row: {
          created_at: string
          description: string | null
          id: string
          release_date: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          release_date: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          release_date?: string
          title?: string
        }
        Relationships: []
      }
      user_article_reactions: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          issue_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          issue_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          issue_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_article_reactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_reactions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_reactions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_article_views: {
        Row: {
          article_id: string
          id: string
          issue_id: string | null
          user_id: string
          viewed_at: string
        }
        Insert: {
          article_id: string
          id?: string
          issue_id?: string | null
          user_id: string
          viewed_at?: string
        }
        Update: {
          article_id?: string
          id?: string
          issue_id?: string | null
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_views_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_views_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_article_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          issue_id: string | null
          user_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          issue_id?: string | null
          user_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          issue_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "mv_published_issues_archive"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "online_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_votes: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "content_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      comments_highlight: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          body: string | null
          created_at: string | null
          id: string | null
          thread_id: string | null
          votes: number | null
        }
        Relationships: []
      }
      mv_community_stats: {
        Row: {
          last_updated: string | null
          online_users: number | null
          total_comments: number | null
          total_issues: number | null
          total_posts: number | null
          total_users: number | null
        }
        Relationships: []
      }
      mv_published_issues_archive: {
        Row: {
          authors: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string | null
          published_at: string | null
          score: number | null
          specialty: string | null
          title: string | null
          year: string | null
        }
        Relationships: []
      }
      online_users: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          last_active: string | null
        }
        Relationships: []
      }
      threads_top: {
        Row: {
          comments: number | null
          created_at: string | null
          id: string | null
          thread_type: string | null
          title: string | null
          votes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _ltree_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      _ltree_gist_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      create_materialized_view_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_tag_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_archive_metadata: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_community_posts_with_details: {
        Args: {
          p_user_id: string
          p_active_tab: string
          p_search_term: string
          p_limit?: number
          p_offset?: number
        }
        Returns: Json[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_id_optimized: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_featured_issue: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          cover_image_url: string
          specialty: string
          published_at: string
          featured: boolean
          description: string
          authors: string
          year: string
          score: number
        }[]
      }
      get_home_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_issues_batch: {
        Args: { p_issue_ids: string[] }
        Returns: {
          id: string
          title: string
          cover_image_url: string
          specialty: string
          published_at: string
          created_at: string
          featured: boolean
          published: boolean
          score: number
        }[]
      }
      get_materialized_view_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          view_name: string
          size: string
          last_refresh: string
          is_stale: boolean
        }[]
      }
      get_online_users_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_optimized_issues: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_specialty?: string
          p_featured_only?: boolean
          p_include_unpublished?: boolean
        }
        Returns: {
          id: string
          title: string
          cover_image_url: string
          specialty: string
          published_at: string
          created_at: string
          featured: boolean
          published: boolean
          score: number
          description: string
          authors: string
          year: string
        }[]
      }
      get_optimized_issues_v2: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_specialty?: string
          p_featured_only?: boolean
          p_include_unpublished?: boolean
          p_include_content?: boolean
        }
        Returns: {
          id: string
          title: string
          cover_image_url: string
          specialty: string
          published_at: string
          created_at: string
          featured: boolean
          published: boolean
          score: number
          description: string
          authors: string
          year: string
        }[]
      }
      get_performance_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_popular_issues: {
        Args: { period_days?: number; max_items?: number }
        Returns: {
          id: string
          title: string
          cover_image_url: string
          specialty: string
          published_at: string
          view_count: number
        }[]
      }
      get_query_performance_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_review_with_blocks: {
        Args: { review_id: string }
        Returns: Json
      }
      get_sidebar_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_top_threads: {
        Args: { min_comments?: number }
        Returns: {
          id: string
          title: string
          comments: number
          votes: number
          created_at: string
          thread_type: string
        }[]
      }
      get_total_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      increment_votes: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never> | { uid: string }
        Returns: boolean
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin_optimized: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_editor_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_editor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_editor_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      lca: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      lquery_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      lquery_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      lquery_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      lquery_send: {
        Args: { "": unknown }
        Returns: string
      }
      ltree_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltree_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltree_gist_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltree_gist_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      ltree_gist_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltree_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltree_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltree_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltree_send: {
        Args: { "": unknown }
        Returns: string
      }
      ltree2text: {
        Args: { "": unknown }
        Returns: string
      }
      ltxtq_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltxtq_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltxtq_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      ltxtq_send: {
        Args: { "": unknown }
        Returns: string
      }
      nlevel: {
        Args: { "": unknown }
        Returns: number
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_rls_no_recursion: {
        Args: { _rel: unknown }
        Returns: boolean
      }
      text2ltree: {
        Args: { "": string }
        Returns: unknown
      }
      unpin_expired_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      review_status: "draft" | "in_review" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      review_status: ["draft", "in_review", "approved", "rejected"],
    },
  },
} as const
