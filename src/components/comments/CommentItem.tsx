
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/commentTypes';
import { CommentForm } from './CommentForm';
import { ArrowUp, ArrowDown, Trash2, MessageSquare } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
          </div>
          
          <p className="text-sm mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <Button 
                onClick={handleUpvote}
                className={`p-1 ${localUserVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}
                disabled={isVoting || !user}
                variant="ghost"
                size="sm"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className={`${
                localScore > 0 ? 'text-orange-500' : 
                localScore < 0 ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {localScore}
              </span>
              <Button 
                onClick={handleDownvote}
                className={`p-1 ${localUserVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}
                disabled={isVoting || !user}
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
              <MessageSquare className="h-4 w-4 mr-1" />
              Responder
            </Button>
            
            {user && (user.id === comment.user_id) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="text-gray-400 hover:text-red-400"
                    disabled={isDeleting}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(comment.id)}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
}
