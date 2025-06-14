
// ABOUTME: Comment section with fixed entity validation and type resolution
import React from 'react';
import { useComments } from '@/hooks/comments';
import { useAuth } from '@/contexts/AuthContext';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentSectionHeader } from './CommentSectionHeader';
import { EntityType } from '@/types/commentTypes';
import { toast } from '@/hooks/use-toast';

interface CommentSectionProps {
  postId?: string;
  articleId?: string;
  issueId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, articleId, issueId }) => {
  const { user } = useAuth();
  
  // Determine entity type and ID with proper validation
  let entityId: string = '';
  let entityType: EntityType = 'issue'; // Default fallback
  
  // Priority order: postId > articleId > issueId
  if (postId) {
    entityId = postId;
    entityType = 'post';
  } else if (articleId) {
    entityId = articleId;
    entityType = 'article';
  } else if (issueId) {
    entityId = issueId;
    entityType = 'issue';
  }
  
  // Early return if no valid entity ID is provided
  if (!entityId) {
    console.error('CommentSection: No valid entity ID provided', { postId, articleId, issueId });
    return (
      <div className="text-center p-4 text-gray-400 border border-dashed border-gray-700 rounded-md">
        Erro: Identificador de entidade não encontrado para comentários
      </div>
    );
  }
  
  // Log entity initialization only once when entity changes
  React.useEffect(() => {
    console.log(`CommentSection initialized for ${entityType} with ID: ${entityId}`);
  }, [entityId, entityType]);
  
  const {
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
  } = useComments(entityId, entityType);

  // Wrapper functions to handle async operations properly
  const handleAddComment = async (content: string, imageUrl?: string): Promise<void> => {
    if (!user) {
      toast({ title: "Autenticação necessária", description: "Você precisa estar logado para comentar.", variant: "destructive" });
      throw new Error("User not authenticated");
    }
    try {
      await addComment(content, user.id);
    } catch (error) {
      console.error('Error in handleAddComment:', error);
      throw error; // Re-throw to let the form handle the error display
    }
  };

  const handleDeleteComment = async (id: string): Promise<void> => {
    try {
      await deleteComment(id);
    } catch (error) {
      console.error('Error in handleDeleteComment:', error);
      throw error;
    }
  };

  const handleReplyToComment = async (params: { parentId: string; content: string; imageUrl?: string }): Promise<void> => {
    if (!user) {
      toast({ title: "Autenticação necessária", description: "Você precisa estar logado para responder.", variant: "destructive" });
      throw new Error("User not authenticated");
    }
    try {
      await replyToComment(params.content, params.parentId, user.id);
    } catch (error) {
      console.error('Error in handleReplyToComment:', error);
      throw error;
    }
  };

  const handleVoteComment = async (params: { commentId: string; value: 1 | -1 | 0 }): Promise<void> => {
    try {
      await voteComment(params);
    } catch (error) {
      console.error('Error in handleVoteComment:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <CommentSectionHeader 
        commentCount={comments.length} 
        isLoading={isLoading}
      />
      
      {user && (
        <CommentForm 
          onSubmit={handleAddComment}
          isSubmitting={isAddingComment}
          placeholder={`Adicione um comentário sobre ${entityType === 'post' ? 'esta publicação' : entityType === 'article' ? 'este artigo' : 'esta edição'}...`}
        />
      )}

      <CommentList 
        comments={comments}
        isLoading={isLoading}
        onDelete={handleDeleteComment}
        onReply={handleReplyToComment}
        onVote={handleVoteComment}
        isDeleting={isDeletingComment}
        isReplying={isReplying}
        isVoting={isVoting}
      />
    </div>
  );
};
