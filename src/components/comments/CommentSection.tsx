
import React from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  
  // Added debugging to verify postId is passed correctly
  console.log("DEBUG: Post ID for comments:", postId);
  
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
  } = useComments(postId, 'post');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Comentários</h3>
      
      <CommentForm 
        onSubmit={addComment}
        isSubmitting={isAddingComment}
      />

      {isLoading ? (
        <div className="text-center text-gray-400">Carregando comentários...</div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onDelete={deleteComment}
              onReply={replyToComment}
              onVote={voteComment}
              isDeleting={isDeletingComment}
              isReplyingFromHook={isReplying}
              isVoting={isVoting}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 p-4">
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </div>
      )}
    </div>
  );
};
