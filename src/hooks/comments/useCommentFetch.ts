
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BaseComment, Comment, CommentVote, EntityType } from '@/types/commentTypes';
import { useToast } from '@/hooks/use-toast';
import { getEntityIdField } from '@/utils/commentHelpers';
import { organizeComments } from '@/utils/commentHelpers';

/**
 * Hook for fetching comments for a specific entity
 */
export function useCommentFetch(entityId: string, entityType: EntityType = 'article') {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Determine which field to use based on entity type
  const idField = getEntityIdField(entityType);

  const fetchComments = async (): Promise<void> => {
    if (!entityId) return;
    
    setIsLoading(true);
    try {
      // Fetch comments for this entity
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq(idField, entityId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // If user is authenticated, fetch their votes
      let userVotes: CommentVote[] = [];
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: votesData, error: votesError } = await supabase
          .from('comment_votes')
          .select('*')
          .eq('user_id', user.id)
          .in('comment_id', commentsData?.map(c => c.id) || []);

        if (!votesError && votesData) {
          // Map votes to the correct CommentVote type
          userVotes = votesData.map(vote => ({
            comment_id: vote.comment_id,
            user_id: vote.user_id,
            value: vote.value === 1 ? 1 : -1
          }));
        }
      }

      // Organize comments into a tree structure
      const organizedComments = organizeComments({
        comments: commentsData || [],
        userVotes
      });

      setComments(organizedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erro ao carregar comentários",
        description: "Não foi possível carregar os comentários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run fetchComments on mount and whenever entityId or entityType changes
  useEffect(() => {
    if (entityId) {
      fetchComments();
    }
  }, [entityId, entityType]);

  return {
    comments,
    setComments,
    isLoading,
    fetchComments
  };
}
