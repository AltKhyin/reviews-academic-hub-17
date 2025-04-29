
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, CommentVote } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useComments = (entityId: string, entityType: 'article' | 'issue' = 'article') => {
  const queryClient = useQueryClient();
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
            .select('comment_id, value')
            .eq('user_id', user.id)
            .in('comment_id', commentsData.map(c => c.id));
            
          if (votesError) {
            console.error('Error fetching votes:', votesError);
          } else if (votesData) {
            userVotes = votesData;
          }
        }
        
        // Get comment scores
        const { data: scoresData, error: scoresError } = await supabase
          .from('comment_votes')
          .select('comment_id, value')
          .in('comment_id', commentsData.map(c => c.id));
          
        if (scoresError) {
          console.error('Error fetching comment scores:', scoresError);
        }
        
        // Calculate scores for each comment
        const commentScores: Record<string, number> = {};
        
        if (scoresData) {
          scoresData.forEach(vote => {
            if (!commentScores[vote.comment_id]) {
              commentScores[vote.comment_id] = 0;
            }
            commentScores[vote.comment_id] += vote.value;
          });
        }
        
        return { 
          comments: commentsData,
          userVotes,
          commentScores
        };
      } catch (error) {
        console.error('Error in useComments query:', error);
        return { comments: [], userVotes: [], commentScores: {} };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  // Organize comments into a hierarchical structure
  const organizedComments = useMemo(() => {
    if (!commentsData?.comments) return [];
    
    const { comments, userVotes, commentScores } = commentsData;
    
    // Map of user votes by comment ID
    const userVotesMap: Record<string, number> = {};
    userVotes.forEach(vote => {
      userVotesMap[vote.comment_id] = vote.value;
    });
    
    // Create map for quick lookup of comments by ID
    const commentMap: Record<string, Comment> = {};
    
    // Process comments to add scores and user votes
    const processedComments = comments.map(comment => {
      const commentWithScore: Comment = {
        ...comment,
        score: commentScores[comment.id] || 0,
        userVote: userVotesMap[comment.id] as 1 | -1 | 0 || 0,
        replies: []
      };
      
      // Add to map for quick lookup
      commentMap[comment.id] = commentWithScore;
      
      return commentWithScore;
    });
    
    // Organize into parent-child relationship
    const topLevelComments: Comment[] = [];
    
    processedComments.forEach(comment => {
      if (!comment.parent_id) {
        // This is a top-level comment
        topLevelComments.push(comment);
      } else if (commentMap[comment.parent_id]) {
        // This is a reply to another comment
        if (!commentMap[comment.parent_id].replies) {
          commentMap[comment.parent_id].replies = [];
        }
        commentMap[comment.parent_id].replies!.push(comment);
      } else {
        // This is a reply but the parent was not found, treat as top-level
        console.warn(`Parent comment ${comment.parent_id} not found for comment ${comment.id}`);
        topLevelComments.push(comment);
      }
    });
    
    // Sort replies by created_at
    Object.values(commentMap).forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });
    
    return topLevelComments;
  }, [commentsData]);

  // Add a new comment
  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
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

  // Reply to a comment
  const replyToComment = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string, content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create the reply comment object
      const commentData: any = {
        content,
        user_id: user.id,
        parent_id: parentId
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
        title: "Resposta adicionada",
        description: "Sua resposta foi publicada com sucesso.",
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
    mutationFn: async ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Check if the user has already voted on this comment
      const { data: existingVote, error: checkError } = await supabase
        .from('comment_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If value is 0, delete the vote if it exists
      if (value === 0 && existingVote) {
        const { error: deleteError } = await supabase
          .from('comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
          
        if (deleteError) throw deleteError;
        return { success: true };
      }
      
      // If value is not 0, upsert the vote
      if (value !== 0) {
        const { error: upsertError } = await supabase
          .from('comment_votes')
          .upsert({
            user_id: user.id,
            comment_id: commentId,
            value
          }, { 
            onConflict: 'user_id,comment_id', 
            ignoreDuplicates: false 
          });
          
        if (upsertError) throw upsertError;
      }
      
      return { success: true };
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
    addComment: (content: string) => addComment.mutate(content),
    replyToComment: (parentId: string, content: string) => 
      replyToComment.mutate({ parentId, content }),
    deleteComment: deleteComment.mutate,
    voteComment: ({ commentId, value }: { commentId: string; value: 1 | -1 | 0 }) => 
      voteComment.mutate({ commentId, value }),
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isVoting: voteComment.isPending,
    isReplying: replyToComment.isPending
  };
};
