
import React from 'react';
import { CommentItem } from './CommentItem';
import { Comment } from '@/types/commentTypes';
import { motion, AnimatePresence } from 'framer-motion';

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
      <AnimatePresence>
        {comments.map(comment => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <CommentItem 
              comment={comment} 
              onDelete={onDelete}
              onReply={onReply}
              onVote={onVote}
              isDeleting={isDeleting}
              isReplyingFromHook={isReplying}
              isVoting={isVoting}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
