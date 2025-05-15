
import React from 'react';
import { useComments } from '@/hooks/comments';
import { useAuth } from '@/contexts/AuthContext';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentSectionHeader } from './CommentSectionHeader';
import { EntityType } from '@/types/commentTypes';

interface CommentSectionProps {
  postId?: string;
  articleId?: string;
  issueId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, articleId, issueId }) => {
  const { user } = useAuth();
  
  // Determine entity type and ID
  let entityId: string = '';
  let entityType: 'article' | 'issue' | 'post' = 'issue'; // Default to 'issue'
  
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
  
  // Add debugging to verify entity information is correct
  console.log(`CommentSection rendering for ${entityType} with ID: ${entityId}`);
  
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

  // Create wrapper functions to handle the type mismatches
  const handleAddComment = async (content: string): Promise<void> => {
    await addComment(content);
    return;
  };

  const handleDeleteComment = async (id: string): Promise<void> => {
    await deleteComment(id);
    return;
  };

  const handleReplyToComment = async (params: { parentId: string; content: string }): Promise<void> => {
    await replyToComment(params);
    return;
  };

  const handleVoteComment = async (params: { commentId: string; value: 1 | -1 | 0 }): Promise<void> => {
    await voteComment(params);
    return;
  };

  return (
    <div className="space-y-4">
      <CommentSectionHeader 
        commentCount={comments.length} 
        isLoading={isLoading}
      />
      
      <CommentForm 
        onSubmit={handleAddComment}
        isSubmitting={isAddingComment}
      />

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
