
import React from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
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
  let entityType: EntityType = 'post';
  
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

  return (
    <div className="space-y-4">
      <CommentSectionHeader 
        commentCount={comments.length} 
        isLoading={isLoading}
      />
      
      <CommentForm 
        onSubmit={addComment}
        isSubmitting={isAddingComment}
      />

      <CommentList 
        comments={comments}
        isLoading={isLoading}
        onDelete={deleteComment}
        onReply={replyToComment}
        onVote={voteComment}
        isDeleting={isDeletingComment}
        isReplying={isReplying}
        isVoting={isVoting}
      />
    </div>
  );
};
