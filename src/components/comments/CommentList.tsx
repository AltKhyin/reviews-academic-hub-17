
import React from 'react';
import { CommentItem } from './CommentItem';
import { Comment } from '@/types/commentTypes';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onReply: (params: { parentId: string; content: string }) => Promise<void>;
  onVote: (params: { commentId: string; value: 1 | -1 | 0 }) => Promise<void>;
  isDeleting: boolean;
  isReplying: boolean;
  isVoting: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  isLoading, 
  onDelete, 
  onReply, 
  onVote, 
  isDeleting,
  isReplying,
  isVoting
}) => {
  if (isLoading) {
    return <div className="text-center text-gray-400">Carregando comentários...</div>;
  }
  
  if (comments.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        Nenhum comentário ainda. Seja o primeiro a comentar!
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onDelete={onDelete}
          onReply={onReply}
          onVote={onVote}
          isDeleting={isDeleting}
          isReplyingFromHook={isReplying}
          isVoting={isVoting}
        />
      ))}
    </div>
  );
};
