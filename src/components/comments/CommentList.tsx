
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<any>;
  onReply: (params: { parentId: string; content: string }) => Promise<any>;
  onVote: (params: { commentId: string; value: 1 | -1 | 0 }) => Promise<any>;
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
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-l-2 border-gray-700/50 pl-4 py-1">
            <div className="flex items-start gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Nenhum comentário ainda. Seja o primeiro a comentar!
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
