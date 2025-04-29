
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export const useArticleView = (articleId: string) => {
  const { toast } = useToast();
  const [isReviewer, setIsReviewer] = useState(false);
  const [hasPermissionToReview, setHasPermissionToReview] = useState(false);

  // Fetch article data
  const { data: article, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
    staleTime: 60000,
  });

  // Fetch issue data (in this case, article ID is the same as issue ID)
  const { data: issue, isLoading: isLoadingIssue } = useQuery({
    queryKey: ['issue', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', articleId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
    staleTime: 60000,
  });
  
  // Fetch external lectures
  const { data: externalLectures, isLoading: isLoadingLectures } = useQuery({
    queryKey: ['external-lectures', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_lectures')
        .select('*')
        .eq('issue_id', articleId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!articleId,
    staleTime: 60000,
  });
  
  // Fetch article reviews
  const { 
    data: allReviews, 
    isLoading: isLoadingReviews,
    refetch: refetchReviews
  } = useQuery({
    queryKey: ['article-reviews', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_reviews')
        .select(`
          *,
          reviewer:reviewer_id (
            id, 
            full_name,
            avatar_url
          )
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!articleId,
    staleTime: 60000,
  });
  
  // Get current user's review if any
  const { data: userReview } = useQuery({
    queryKey: ['user-review', articleId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('article_reviews')
        .select('*')
        .eq('article_id', articleId)
        .eq('reviewer_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
    staleTime: 60000,
  });

  // Track article view
  useEffect(() => {
    const trackView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if articleId is a valid UUID
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);
        if (!isValidUUID) {
          console.log('Invalid UUID format for articleId:', articleId);
          return;
        }

        const { error } = await supabase
          .from('user_article_views')
          .upsert({ 
            article_id: articleId,
            user_id: user.id,
            viewed_at: new Date().toISOString()
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error tracking article view:', error);
          toast({
            variant: "destructive",
            description: "Erro ao registrar visualização",
          });
        }
      } catch (error) {
        console.error('Error in useArticleView:', error);
      }
    };

    trackView();
  }, [articleId, toast]);
  
  // Check if user is a reviewer with permissions
  useEffect(() => {
    const checkReviewerStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Check if user is an admin or editor
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profile && (profile.role === 'admin' || profile.role === 'editor')) {
          setIsReviewer(true);
          setHasPermissionToReview(true);
        }
      } catch (error) {
        console.error('Error checking reviewer status:', error);
      }
    };
    
    checkReviewerStatus();
  }, []);

  return {
    article,
    issue,
    externalLectures,
    isLoading: isLoadingArticle || isLoadingIssue || isLoadingLectures || isLoadingReviews,
    isReviewer,
    hasPermissionToReview,
    userReview,
    allReviews,
    refetchReviews
  };
};
