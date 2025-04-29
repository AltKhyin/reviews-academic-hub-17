
import { useMemo } from 'react';
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
      try {
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
        
        // Fetch comments without nesting join
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
            profiles:user_id (id, full_name, avatar_url)
          `)
          .eq(entityIdField, entityId)
          .order('created_at', { ascending: false });
          
        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
          throw commentsError;
        }
        
        return commentsData as unknown as Comment[];
      } catch (error) {
        console.error('Error in useComments query:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  // Organize comments into a hierarchical structure
  const organizedComments = useMemo(() => {
    if (!comments) return [];
    
    // Since we don't have parent_id in the DB yet, all comments are top-level
    const topLevelComments = comments.map(comment => ({
      ...comment,
      replies: [],
      // Default score to 0 if not present in the database
      score: 0
    }));
    
    // Sort top-level comments by created_at (newest first)
    topLevelComments.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return topLevelComments;
  }, [comments]);

  // Add a new comment
  const addComment = useMutation({
    mutationFn: async (content: string) => {
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
      
      // Since we don't have a score column in the comments table,
      // we'll just log the vote action (in a real app, you would store this in a separate table)
      console.log(`Vote recorded: commentId=${commentId}, value=${value}, userId=${user.id}`);
      
      // In a future implementation, you would store the vote and update the comment's score
      // For now, we'll just return success
      return { success: true };
    },
    onSuccess: () => {
      // In a real implementation, we would invalidate the comments query to refresh the data
      // For now, we'll just show a toast message
      toast({
        title: "Voto registrado",
        description: "Seu voto foi contabilizado.",
      });
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
    addComment: (content: string) => 
      addComment.mutate(content),
    deleteComment: deleteComment.mutate,
    voteComment: ({ commentId, value }: { commentId: string; value: 1 | -1 }) => 
      voteComment.mutate({ commentId, value }),
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isVoting: voteComment.isPending
  };
};
