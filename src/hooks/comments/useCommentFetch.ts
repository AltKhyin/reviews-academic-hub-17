
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommentType } from '@/types/comment';
import { toast } from '@/components/ui/use-toast';
import { processComments } from '@/utils/commentHelpers';

export const useCommentFetch = (articleId: string | undefined) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshComments = () => {
    setRefreshCounter(prev => prev + 1);
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (!articleId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fixed the type issue by explicitly defining the return type
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:user_id (id, email),
            votes:comment_votes (id, user_id, value)
          `)
          .eq('article_id', articleId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const processedComments = processComments(data || []);
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

    fetchComments();
  }, [articleId, refreshCounter]);

  return { comments, loading, error, refreshComments };
};
