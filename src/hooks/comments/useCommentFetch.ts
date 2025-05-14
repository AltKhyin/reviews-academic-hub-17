
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/commentTypes';
import { toast } from '@/components/ui/use-toast';
import { organizeComments } from '@/utils/commentOrganize';

export const useCommentFetch = (entityId: string, entityType: 'article' = 'article') => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchComments = async () => {
    if (!entityId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fieldName = `${entityType}_id`;
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (id, email),
          votes:comment_votes (id, user_id, value)
        `)
        .eq(fieldName, entityId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedComments = organizeComments(data || []);
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
