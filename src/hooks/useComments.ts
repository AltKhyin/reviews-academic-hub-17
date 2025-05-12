
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BaseComment, Comment, CommentVote, EntityType } from '@/types/commentTypes';
import { buildCommentData, getEntityIdField, organizeComments } from '@/utils/commentHelpers';
import { useToast } from '@/hooks/use-toast';

export function useComments(entityId: string, entityType: EntityType = 'article') {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Determine which field to use based on entity type
  const idField = getEntityIdField(entityType);

  useEffect(() => {
    if (!entityId) return;
    fetchComments();
  }, [entityId, entityType]);

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
      if (user) {
        const { data: votesData, error: votesError } = await supabase
          .from('comment_votes')
          .select('*')
          .eq('user_id', user.id)
          .in('comment_id', commentsData?.map(c => c.id) || []);

        if (!votesError && votesData) {
          userVotes = votesData;
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

  const addComment = async (content: string): Promise<void> => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para comentar.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) return;

    setIsAddingComment(true);
    try {
      // Create the data object with the right entity ID field
      const commentData = buildCommentData(content, user.id, entityType, entityId);
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          profiles:user_id (
            id, 
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Add the new comment to the state
      const newComment = {
        ...data,
        replies: []
      };

      setComments(prev => [...prev, newComment]);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar seu comentário.",
        variant: "destructive",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const replyToComment = async ({ parentId, content }: { parentId: string; content: string }): Promise<void> => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para responder aos comentários.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) return;

    setIsReplying(true);
    try {
      // Create comment data with parent_id
      const commentData = {
        ...buildCommentData(content, user.id, entityType, entityId),
        parent_id: parentId
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          profiles:user_id (
            id, 
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Refresh all comments to get the proper structure
      await fetchComments();
    } catch (error) {
      console.error('Error replying to comment:', error);
      toast({
        title: "Erro ao responder",
        description: "Não foi possível adicionar sua resposta.",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    if (!user) return;

    setIsDeletingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove the comment from state
      // For simplicity, just refetch comments to handle nested deletions
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o comentário.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  const voteComment = async ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }): Promise<void> => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para votar em comentários.",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(true);
    try {
      // Check if user already voted on this comment
      const { data: existingVote, error: checkError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingVote) {
        if (value === 0) {
          // Remove vote
          const { error: deleteError } = await supabase
            .from('comment_votes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        } else if (existingVote.value !== value) {
          // Update vote
          const { error: updateError } = await supabase
            .from('comment_votes')
            .update({ value })
            .eq('comment_id', commentId)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        }
        // If the vote is the same, do nothing (toggle handled in the UI)
      } else if (value !== 0) {
        // Insert new vote
        const { error: insertError } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            value
          });

        if (insertError) throw insertError;
      }

      // Wait briefly for the trigger to update the score
      setTimeout(() => {
        // Refresh comments to get updated scores
        fetchComments();
      }, 300);
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto no comentário.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return {
    comments,
    isLoading,
    addComment,
    replyToComment,
    deleteComment,
    voteComment,
    isAddingComment,
    isDeletingComment,
    isReplying,
    isVoting
  };
}
