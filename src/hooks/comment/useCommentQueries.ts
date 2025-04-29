
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, CommentVote } from '@/types/issue';

export const useCommentQueries = (entityId: string, entityType: 'article' | 'issue' = 'article') => {
  const entityIdField = entityType === 'article' ? 'article_id' : 'issue_id';

  // Fetch comments for the entity with votes for current user
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', entityId, entityType],
    queryFn: async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // First, verify if the entity exists
        if (entityType === 'article') {
          const { data: entityExists, error: entityError } = await supabase
            .from('articles')
            .select('id')
            .eq('id', entityId)
            .maybeSingle();
          
          if (entityError) throw entityError;
          
          if (!entityExists) {
            console.error(`Article with ID ${entityId} not found`);
            return { comments: [], userVotes: [] };
          }
        } else {
          const { data: entityExists, error: entityError } = await supabase
            .from('issues')
            .select('id')
            .eq('id', entityId)
            .maybeSingle();
          
          if (entityError) throw entityError;
          
          if (!entityExists) {
            console.error(`Issue with ID ${entityId} not found`);
            return { comments: [], userVotes: [] };
          }
        }
        
        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id, 
            content, 
            created_at, 
            updated_at, 
            user_id, 
            article_id, 
            issue_id,
            parent_id,
            score,
            profiles:user_id (id, full_name, avatar_url)
          `)
          .eq(entityIdField, entityId)
          .order('created_at', { ascending: false });
          
        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
          throw commentsError;
        }
        
        // Fetch comment votes if user is logged in
        let userVotes: CommentVote[] = [];
        
        if (user) {
          const { data: votesData, error: votesError } = await supabase
            .from('comment_votes')
            .select('comment_id, value, user_id')
            .eq('user_id', user.id)
            .in('comment_id', commentsData.map(c => c.id));
            
          if (votesError) {
            console.error('Error fetching votes:', votesError);
          } else if (votesData) {
            userVotes = votesData as CommentVote[];
          }
        }
        
        return { 
          comments: commentsData,
          userVotes
        };
      } catch (error) {
        console.error('Error in useComments query:', error);
        return { comments: [], userVotes: [] };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  return {
    commentsData,
    isLoading
  };
};
