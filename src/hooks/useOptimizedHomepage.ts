// ABOUTME: Optimized homepage data loading with request batching and deduplication
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequestBatcher } from './useRequestBatcher';
import { useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

interface HomepageIssue {
  id: string;
  title: string;
  cover_image_url: string | null;
  specialty: string;
  published_at: string | null;
  created_at: string;
  featured: boolean | null;
  published: boolean;
  score: number | null;
}

interface ReviewerComment {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  comment: string;
  created_at: string;
}

interface SectionConfig {
  id: string;
  visible: boolean;
  order?: number;
  title?: string;
}

interface HomepageData {
  issues: HomepageIssue[];
  sectionVisibility: SectionConfig[];
  featuredIssue: HomepageIssue | null;
  reviewerComments: ReviewerComment[];
  errors: {
    issues: PostgrestError | null;
    sectionVisibility: PostgrestError | null;
    featuredIssue: PostgrestError | null;
    reviewerComments: PostgrestError | null;
  };
}

// "Type boundary" fix: Cast all supabase .data directly to concrete types before returning.
// This prevents TS from recursing into deep/unknown Json types in react-query inference.
const _fetchHomepageData = async (): Promise<HomepageData> => {
  const [issues, sectionVisibility, featuredIssue, reviewerComments] = await Promise.all([
    supabase
      .from('issues')
      .select('id, title, cover_image_url, specialty, published_at, created_at, featured, published, score')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(20),
    
    supabase
      .from('site_meta')
      .select('value')
      .eq('key', 'homepage_sections')
      .single(),
      
    supabase
      .from('issues')
      .select('id, title, cover_image_url, specialty, published_at, created_at, featured, published, score')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('reviewer_comments')
      .select('id, reviewer_name, reviewer_avatar, comment, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  // Defensive cast for each field to break recursive type inference
  const issuesArr = (issues.data ?? []) as HomepageIssue[];
  const featured = featuredIssue.data ? (featuredIssue.data as HomepageIssue) : null;
  let sectionVisibilityArr: SectionConfig[] = [];
  try {
    // Try to coerce and check at runtime
    if (Array.isArray(sectionVisibility.data?.value)) {
      sectionVisibilityArr = sectionVisibility.data.value as unknown as SectionConfig[];
    }
  } catch (e) {
    sectionVisibilityArr = [];
  }
  const reviewerCommentsArr = (reviewerComments.data ?? []) as ReviewerComment[];

  return {
    issues: issuesArr,
    sectionVisibility: sectionVisibilityArr,
    featuredIssue: featured,
    reviewerComments: reviewerCommentsArr,
    errors: {
      issues: issues.error,
      sectionVisibility: sectionVisibility.error,
      featuredIssue: featuredIssue.error,
      reviewerComments: reviewerComments.error,
    }
  };
};

// Ensure explicit type
const fetchHomepageData: () => Promise<HomepageData> = _fetchHomepageData;

export const useOptimizedHomepage = () => {
  const { batchRequest } = useRequestBatcher();

  const query = useQuery<HomepageData>({
    queryKey: ['homepage-data'],
    queryFn: fetchHomepageData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const batchFetchIssue = useCallback(async (issueId: string) => {
    return batchRequest(
      'issues',
      issueId,
      async (ids: string[]) => {
        const { data } = await supabase
          .from('issues')
          .select('*')
          .in('id', ids);
        const result: Record<string, any> = {};
        (data ?? []).forEach(issue => {
          result[issue.id] = issue;
        });
        return result;
      }
    );
  }, [batchRequest]);

  const batchFetchProfile = useCallback(async (userId: string) => {
    return batchRequest(
      'profiles',
      userId,
      async (ids: string[]) => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .in('id', ids);
        const result: Record<string, any> = {};
        (data ?? []).forEach(profile => {
          result[profile.id] = profile;
        });
        return result;
      }
    );
  }, [batchRequest]);

  return {
    ...query,
    batchFetchIssue,
    batchFetchProfile,
  };
};
