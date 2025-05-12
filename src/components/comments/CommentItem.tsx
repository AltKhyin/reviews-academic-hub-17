
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/commentTypes';
import { CommentForm } from './CommentForm';
import { ArrowUp, ArrowDown } from 'lucide-react';

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

  const handleVote = async (value: 1 | -1 | 0) => {
    if (!user) return;
    await onVote({ commentId: comment.id, value });
  };

  return (
    <div className="border-l-2 border-gray-700/50 pl-4 py-1">
      <div className="flex items-start gap-3">
        <Avatar className="w-6 h-6 mt-1">
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            {displayName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {displayName}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-sm mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <Button 
                onClick={() => handleVote(comment.userVote === 1 ? 0 : 1)}
                className={`p-1 ${comment.userVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}
                disabled={isVoting}
                variant="ghost"
                size="sm"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span>{comment.score}</span>
              <Button 
                onClick={() => handleVote(comment.userVote === -1 ? 0 : -1)}
                className={`p-1 ${comment.userVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}
                disabled={isVoting}
                variant="ghost"
                size="sm"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-gray-400 hover:text-white"
              variant="ghost"
              size="sm"
            >
              Responder
            </Button>
            
            {user && (user.id === comment.user_id) && (
              <Button 
                onClick={() => onDelete(comment.id)}
                className="text-gray-400 hover:text-red-400"
                disabled={isDeleting}
                variant="ghost"
                size="sm"
              >
                Excluir
              </Button>
            )}
          </div>
          
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
