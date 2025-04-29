
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useComments = (entityId: string, entityType: 'article' | 'issue' = 'article') => {
  const queryClient = useQueryClient();
  const entityIdField = entityType === 'article' ? 'article_id' : 'issue_id';

  // Fetch comments for the entity
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', entityId, entityType],
    queryFn: async () => {
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
          return [];
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
          return [];
        }
      }
      
      // Fix: Use explicit any type to avoid TypeScript recursion
      const result = await (supabase as any)
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          parent_id,
          article_id,
          issue_id,
          score,
          profiles(id, full_name, avatar_url)
        `)
        .eq(entityIdField, entityId)
        .order('created_at', { ascending: false });

      if (result.error) throw result.error;
      
      return (result.data || []) as Comment[];
    }
  });

  // Organize comments into a hierarchical structure
  const organizedComments = React.useMemo(() => {
    if (!comments) return [];
    
    const commentMap = new Map<string, Comment & { replies: Comment[] }>();
    const topLevelComments: (Comment & { replies: Comment[] })[] = [];
    
    // First, create entries for all comments in the map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Then, organize them into a tree
    comments.forEach(comment => {
      const enrichedComment = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(enrichedComment);
        } else {
          // If parent doesn't exist (unusual case), treat as top-level
          topLevelComments.push(enrichedComment);
        }
      } else {
        // No parent means it's a top-level comment
        topLevelComments.push(enrichedComment);
      }
    });
    
    // Sort replies by created date
    topLevelComments.forEach(comment => {
      comment.replies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    
    // Sort top-level comments by score (highest first)
    topLevelComments.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    return topLevelComments;
  }, [comments]);

  // Add a new comment
  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Verify entity exists before inserting
      if (entityType === 'article') {
        const { data: entityExists, error: entityError } = await supabase
          .from('articles')
          .select('id')
          .eq('id', entityId)
          .maybeSingle();
          
        if (entityError) throw entityError;
        if (!entityExists) throw new Error(`Article with ID ${entityId} not found`);
      } else {
        const { data: entityExists, error: entityError } = await supabase
          .from('issues')
          .select('id')
          .eq('id', entityId)
          .maybeSingle();
          
        if (entityError) throw entityError;
        if (!entityExists) throw new Error(`Issue with ID ${entityId} not found`);
      }
      
      // Create the comment object with the right fields
      const commentData: any = {
        content,
        user_id: user.id
      };
      
      // Add parent_id if this is a reply
      if (parentId) {
        commentData.parent_id = parentId;
      }
      
      // Set either article_id or issue_id based on entityType
      commentData[entityIdField] = entityId;
      
      const { error, data } = await supabase
        .from('comments')
        .insert(commentData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Sucesso",
        description: "Seu comentário foi adicionado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a comment
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Sucesso",
        description: "Comentário excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Vote on a comment
  const voteComment = useMutation({
    mutationFn: async ({ commentId, value }: { commentId: string; value: 1 | -1 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Check if the user has already voted
      const { data: existingVote } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('comment_votes')
          .update({ value })
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            value
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao votar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    comments: organizedComments,
    isLoading,
    addComment: (content: string, parentId?: string) => 
      addComment.mutate({ content, parentId }),
    deleteComment: deleteComment.mutate,
    voteComment: ({ commentId, value }: { commentId: string; value: 1 | -1 }) => 
      voteComment.mutate({ commentId, value }),
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isVoting: voteComment.isPending
  };
};
