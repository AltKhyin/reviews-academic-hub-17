
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/commentTypes';
import { CommentForm } from './CommentForm';
import { CommentButtons } from './CommentButtons';
import { CommentContent, CommentHeader } from './CommentContent';

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => Promise<any>;
  onReply: (params: { parentId: string; content: string }) => Promise<any>;
  onVote: (params: { commentId: string; value: 1 | -1 | 0 }) => Promise<any>;
  isDeleting: boolean;
  isReplyingFromHook: boolean;
  isVoting: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete, 
  onReply,
  onVote,
  isDeleting,
  isReplyingFromHook,
  isVoting
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [localScore, setLocalScore] = useState(comment.score || 0);
  const [localUserVote, setLocalUserVote] = useState<1 | -1 | 0>(comment.userVote || 0);

  // Get user display name from profile data, with fallbacks
  const displayName = comment.profiles?.full_name || 
                      (comment.user_id === user?.id ? user?.user_metadata?.full_name : 'Usuário');

  const handleReply = async (content: string) => {
    try {
      await onReply({ parentId: comment.id, content });
      setIsReplying(false);
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  const handleUpvote = async () => {
    if (!user) return;
    
    // If already upvoted, clicking again removes the vote
    const newValue = localUserVote === 1 ? 0 : 1;
    
    // Optimistic update
    const prevVote = localUserVote;
    setLocalUserVote(newValue);
    setLocalScore(prev => prev - prevVote + newValue);
    
    try {
      await onVote({ commentId: comment.id, value: newValue });
    } catch (error) {
      // Revert on error
      setLocalUserVote(prevVote);
      setLocalScore(comment.score || 0);
      console.error('Error upvoting comment:', error);
    }
  };

  const handleDownvote = async () => {
    if (!user) return;
    
    // If already downvoted, clicking again removes the vote
    const newValue = localUserVote === -1 ? 0 : -1;
    
    // Optimistic update
    const prevVote = localUserVote;
    setLocalUserVote(newValue);
    setLocalScore(prev => prev - prevVote + newValue);
    
    try {
      await onVote({ commentId: comment.id, value: newValue });
    } catch (error) {
      // Revert on error
      setLocalUserVote(prevVote);
      setLocalScore(comment.score || 0);
      console.error('Error downvoting comment:', error);
    }
  };

  const handleDelete = () => onDelete(comment.id);

  return (
    <div className="border-l-2 border-gray-700/50 pl-4 py-1">
      <div className="flex items-start gap-3">
        <CommentHeader 
          profileName={displayName}
          avatarUrl={comment.profiles?.avatar_url} 
          created_at={comment.created_at}
        />
        
        <div className="flex-1 min-w-0">
          <CommentContent
            content={comment.content}
            created_at={comment.created_at}
            profileName={displayName}
            avatarUrl={comment.profiles?.avatar_url}
          />
          
          <CommentButtons
            onReplyClick={() => setIsReplying(!isReplying)}
            onDeleteClick={handleDelete}
            onUpvoteClick={handleUpvote}
            onDownvoteClick={handleDownvote}
            isAuthor={user?.id === comment.user_id}
            userVote={localUserVote}
            score={localScore}
            isDeleting={isDeleting}
            isVoting={isVoting}
            isAuthenticated={!!user}
          />
          
          {isReplying && (
            <div className="mt-3">
              <CommentForm 
                onSubmit={handleReply}
                isSubmitting={isReplyingFromHook}
                placeholder="Escreva sua resposta..."
                buttonText="Responder"
                autoFocus={true}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-2 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply}
                  onDelete={onDelete}
                  onReply={onReply}
                  onVote={onVote}
                  isDeleting={isDeleting}
                  isReplyingFromHook={isReplyingFromHook}
                  isVoting={isVoting}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
