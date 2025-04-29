
import React, { useState } from 'react';
import { Comment } from '@/types/issue';
import { useAuth } from '@/contexts/AuthContext';
import { CommentVote } from '../comment/CommentVote';
import { CommentAvatar } from '../comment/CommentAvatar';
import { CommentContent } from '../comment/CommentContent';
import { CommentActions } from '../comment/CommentActions';
import { CommentForm } from '../comment/CommentForm';

interface CommentItemProps {
  comment: Comment;
  voteComment: (commentId: string, value: 1 | -1 | 0) => Promise<void>;
  replyToComment: (parentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  isVoting: boolean;
  isReplying: boolean;
  isDeletingComment: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  voteComment,
  replyToComment,
  deleteComment,
  isVoting,
  isReplying,
  isDeletingComment
}) => {
  const { user } = useAuth();
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);

  const handleVote = async (value: 1 | -1 | 0) => {
    await voteComment(comment.id, value);
  };

  const handleReplyClick = () => {
    setIsReplyFormOpen(true);
  };

  const handleReplySubmit = async (content: string) => {
    await replyToComment(comment.id, content);
    setIsReplyFormOpen(false);
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(comment.id);
    }
  };

  const canDelete = user?.id === comment.user_id;

  return (
    <div className="border-l-2 border-gray-200 pl-3 mb-4">
      <div className="flex">
        <CommentVote 
          score={comment.score} 
          userVote={comment.userVote} 
          onVote={handleVote} 
          isVoting={isVoting} 
        />
        
        <div className="flex-1">
          <div className="flex items-start">
            <CommentAvatar 
              avatarUrl={comment.profiles?.avatar_url || null} 
              fullName={comment.profiles?.full_name || null} 
            />
            
            <div className="ml-2 flex-1">
              <CommentContent
                fullName={comment.profiles?.full_name || null}
                content={comment.content}
                createdAt={comment.created_at}
              />
              
              <CommentActions 
                canDelete={canDelete} 
                isReplying={isReplying} 
                isDeleting={isDeletingComment}
                onDelete={handleDeleteClick}
                onReply={handleReplyClick}
              />
              
              {isReplyFormOpen && (
                <div className="mt-3">
                  <CommentForm 
                    onSubmit={handleReplySubmit}
                    isSubmitting={isReplying}
                    placeholder="Write a reply..."
                    buttonText="Reply"
                    cancelButton
                    onCancel={() => setIsReplyFormOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Replies section */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-3">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  voteComment={voteComment}
                  replyToComment={replyToComment}
                  deleteComment={deleteComment}
                  isVoting={isVoting}
                  isReplying={isReplying}
                  isDeletingComment={isDeletingComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
