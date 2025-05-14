
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType, BaseComment } from '@/types/commentTypes';
import { toast } from '@/components/ui/use-toast';
import { organizeCommentsInTree } from '@/utils/commentOrganize';
import { fetchCommentsData } from '@/utils/commentFetch';

export const useCommentFetch = (entityId: string, entityType: EntityType = 'article') => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchComments = async () => {
    if (!entityId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { comments: fetchedComments, userVotes } = await fetchCommentsData(entityId, entityType);
      
      // Append user votes to comments and organize them
      const commentsWithVotes = fetchedComments.map(comment => {
        const userVote = userVotes.find(vote => vote.comment_id === comment.id);
        return {
          ...comment,
          userVote: userVote ? userVote.value : 0
        };
      });
      
      const processedComments = organizeCommentsInTree(commentsWithVotes);
      setComments(processedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [entityId, entityType]);

  return { comments, loading, error, fetchComments };
};
