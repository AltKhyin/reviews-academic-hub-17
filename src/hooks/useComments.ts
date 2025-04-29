
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, CommentVote } from '@/types/issue';
import { toast } from '@/hooks/use-toast';

export const useComments = (entityId: string, entityType: 'article' | 'issue' | 'post' = 'article') => {
  const queryClient = useQueryClient();
  const entityIdField = entityType === 'article' ? 'article_id' : 
                        entityType === 'issue' ? 'issue_id' : 'post_id';

  // Fetch comments for the entity with votes for current user
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', entityId, entityType],
    queryFn: async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // First, verify if the entity exists
        let entityExists = false;
        
        if (entityType === 'article') {
          const { data, error } = await supabase
            .from('articles')
            .select('id')
            .eq('id', entityId)
            .maybeSingle();
          
          if (error) throw error;
          entityExists = !!data;
        } else if (entityType === 'issue') {
          const { data, error } = await supabase
            .from('issues')
            .select('id')
            .eq('id', entityId)
            .maybeSingle();
          
          if (error) throw error;
          entityExists = !!data;
        } else if (entityType === 'post') {
          const { data, error } = await supabase
            .from('posts')
            .select('id')
            .eq('id', entityId)
            .maybeSingle();
          
          if (error) throw error;
          entityExists = !!data;
        }
        
        if (!entityExists) {
          console.error(`${entityType} with ID ${entityId} not found`);
          return { comments: [], userVotes: [] };
        }
        
        // Create the select query based on the entity type
        let selectQuery = `
          id, 
          content, 
          created_at, 
          updated_at, 
          user_id, 
          parent_id,
          score,
          profiles:user_id (id, full_name, avatar_url)
        `;
        
        // Add the appropriate entity ID field
        if (entityType === 'article') {
          selectQuery += `, article_id`;
        } else if (entityType === 'issue') {
          selectQuery += `, issue_id`;
        } else if (entityType === 'post') {
          selectQuery += `, post_id`;
        }
        
        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(selectQuery)
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

  // Organize comments into a hierarchical structure
  const organizedComments = useMemo(() => {
    if (!commentsData?.comments) return [];
    
    const { comments, userVotes } = commentsData;
    
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
      const commentData: Record<string, any> = {
        content,
        user_id: user.id,
        score: 0 // Initialize with 0, will be updated by trigger after upvote
      };
      
      // Set either article_id, issue_id, or post_id based on entityType
      commentData[entityIdField] = entityId;
      
      // Insert the comment
      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) throw commentError;
      
      // Add the author's upvote
      if (newComment) {
        const { error: voteError } = await supabase
          .from('comment_votes')
          .insert({
            user_id: user.id,
            comment_id: newComment.id,
            value: 1
          });
        
        if (voteError) console.error('Error adding auto-upvote:', voteError);
      }
      
      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Sucesso",
        description: "Seu comentário foi adicionado.",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    }
  });

  // Reply to a comment
  const replyToComment = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string, content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Create the reply comment object
      const commentData: Record<string, any> = {
        content,
        user_id: user.id,
        parent_id: parentId,
        score: 0 // Initialize with 0, will be updated by trigger after upvote
      };
      
      // Set either article_id, issue_id, or post_id based on entityType
      commentData[entityIdField] = entityId;
      
      // Insert the comment
      const { error: commentError, data: newComment } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (commentError) throw commentError;
      
      // Add the author's upvote
      if (newComment) {
        const { error: voteError } = await supabase
          .from('comment_votes')
          .insert({
            user_id: user.id,
            comment_id: newComment.id,
            value: 1
          });
        
        if (voteError) console.error('Error adding auto-upvote:', voteError);
      }
      
      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', entityId, entityType] });
      toast({
        title: "Resposta adicionada",
        description: "Sua resposta foi publicada com sucesso.",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
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
        duration: 3000, // Auto-dismiss after 3 seconds
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
        duration: 5000, // Auto-dismiss after 5 seconds
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
        duration: 5000, // Auto-dismiss after 5 seconds
      });
    }
  });

  return {
    comments: organizedComments,
    isLoading,
    addComment: (content: string) => addComment.mutateAsync(content),
    replyToComment: async ({ parentId, content }: { parentId: string, content: string }) => {
      return await replyToComment.mutateAsync({ parentId, content });
    },
    deleteComment: (commentId: string) => deleteComment.mutate(commentId),
    voteComment: async (params: { commentId: string; value: 1 | -1 | 0 }) => {
      return voteComment.mutate(params);
    },
    isAddingComment: addComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isVoting: voteComment.isPending,
    isReplying: replyToComment.isPending
  };
};
