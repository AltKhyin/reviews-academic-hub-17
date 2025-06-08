
// ABOUTME: Optimized data management hook for the home page system
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HomeSettings, ReviewerNote, PopularIssue, HomeIssue } from '@/types/home';

export const useHomeData = () => {
  const queryClient = useQueryClient();

  // Get home settings with proper type safety
  const { data: homeSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['homeSettings'],
    queryFn: async (): Promise<HomeSettings> => {
      const { data, error } = await supabase.rpc('get_home_settings');
      if (error) throw error;
      
      // Safe JSON parsing with fallback
      try {
        return data as HomeSettings;
      } catch {
        return getDefaultHomeSettings();
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get reviewer notes
  const { data: reviewerNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['reviewerNotes'],
    queryFn: async (): Promise<ReviewerNote[]> => {
      const { data, error } = await supabase
        .from('reviewer_notes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get featured issues (now supports multiple) - using HomeIssue type
  const { data: featuredIssues, isLoading: featuredLoading } = useQuery({
    queryKey: ['featuredIssues'],
    queryFn: async (): Promise<HomeIssue[]> => {
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, cover_image_url, specialty, published_at, description, authors, score')
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Get recent issues - using HomeIssue type
  const { data: recentIssues, isLoading: recentLoading } = useQuery({
    queryKey: ['recentIssues', homeSettings?.recent_issues?.max_items],
    queryFn: async (): Promise<HomeIssue[]> => {
      const limit = homeSettings?.recent_issues?.max_items || 10;
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, cover_image_url, specialty, published_at, description, authors, score')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!homeSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get popular issues
  const { data: popularIssues, isLoading: popularLoading } = useQuery({
    queryKey: ['popularIssues', homeSettings?.popular_issues?.period, homeSettings?.popular_issues?.max_items],
    queryFn: async (): Promise<PopularIssue[]> => {
      const period = homeSettings?.popular_issues?.period === 'week' ? 7 : 30;
      const limit = homeSettings?.popular_issues?.max_items || 10;
      
      const { data, error } = await supabase.rpc('get_popular_issues', {
        period_days: period,
        max_items: limit
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!homeSettings,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Get recommended issues (simplified algorithm for now) - using HomeIssue type
  const { data: recommendedIssues, isLoading: recommendedLoading } = useQuery({
    queryKey: ['recommendedIssues', homeSettings?.recommended_issues?.max_items],
    queryFn: async (): Promise<HomeIssue[]> => {
      const limit = homeSettings?.recommended_issues?.max_items || 10;
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, cover_image_url, specialty, published_at, description, authors, score')
        .eq('published', true)
        .not('score', 'is', null)
        .order('score', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!homeSettings,
    staleTime: 20 * 60 * 1000, // 20 minutes
  });

  // Update home settings mutation
  const updateHomeSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<HomeSettings>) => {
      const currentSettings = homeSettings || getDefaultHomeSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      const { data, error } = await supabase
        .from('site_meta')
        .upsert({
          key: 'home_settings',
          value: updatedSettings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSettings'] });
    }
  });

  // Track issue view mutation
  const trackIssueViewMutation = useMutation({
    mutationFn: async ({ issueId, sessionId }: { issueId: string; sessionId?: string }) => {
      const { error } = await supabase
        .from('issue_views')
        .insert({
          issue_id: issueId,
          session_id: sessionId || `session_${Date.now()}_${Math.random()}`,
          user_agent: navigator.userAgent
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate popular issues after tracking
      queryClient.invalidateQueries({ queryKey: ['popularIssues'] });
    }
  });

  const isLoading = settingsLoading || notesLoading || featuredLoading || recentLoading || popularLoading || recommendedLoading;

  return {
    homeSettings,
    reviewerNotes,
    featuredIssues,
    recentIssues,
    popularIssues,
    recommendedIssues,
    isLoading,
    updateHomeSettings: updateHomeSettingsMutation.mutateAsync,
    trackIssueView: trackIssueViewMutation.mutateAsync,
    isUpdating: updateHomeSettingsMutation.isPending
  };
};

const getDefaultHomeSettings = (): HomeSettings => ({
  sections: {
    reviewer_notes: { visible: true, order: 0 },
    featured_carousel: { visible: true, order: 1 },
    recent_issues: { visible: true, order: 2, days_for_new_badge: 7 },
    popular_issues: { visible: true, order: 3, period: 'week' },
    recommended_issues: { visible: true, order: 4 },
    upcoming_releases: { visible: true, order: 5 }
  },
  recent_issues: {
    days_for_new_badge: 7,
    max_items: 10
  },
  popular_issues: {
    period: 'week',
    max_items: 10
  },
  recommended_issues: {
    max_items: 10
  }
});
