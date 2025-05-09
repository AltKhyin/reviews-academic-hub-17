
import React, { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/commentTypes';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified implementation for the comment section
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Comentários</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="flex items-start gap-3 mb-4">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Adicione um comentário..."
              className="mb-2 resize-none"
              rows={2}
            />
            <Button 
              type="submit" 
              disabled={!content.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center p-4 text-gray-400 border border-dashed border-gray-700 rounded-md">
          Faça login para participar da discussão
        </div>
      )}

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
              isReplying={isReplying}
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

// CommentItem component for displaying individual comments
const CommentItem: React.FC<{
  comment: Comment;
  onDelete: (id: string) => Promise<any>;
  onReply: (params: { parentId: string; content: string }) => Promise<any>;
  onVote: (params: { commentId: string; value: 1 | -1 | 0 }) => Promise<any>;
  isDeleting: boolean;
  isReplying: boolean;
  isVoting: boolean;
}> = ({ 
  comment, 
  onDelete, 
  onReply,
  onVote,
  isDeleting,
  isReplying,
  isVoting
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    try {
      await onReply({ 
        parentId: comment.id, 
        content: replyContent 
      });
      setReplyContent('');
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
            {comment.profiles?.full_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {comment.profiles?.full_name || 'Usuário'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-sm mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => handleVote(comment.userVote === 1 ? 0 : 1)}
                className={`p-1 ${comment.userVote === 1 ? 'text-blue-400' : 'text-gray-400'}`}
                disabled={isVoting}
              >
                ↑
              </button>
              <span>{comment.score}</span>
              <button 
                onClick={() => handleVote(comment.userVote === -1 ? 0 : -1)}
                className={`p-1 ${comment.userVote === -1 ? 'text-red-400' : 'text-gray-400'}`}
                disabled={isVoting}
              >
                ↓
              </button>
            </div>
            
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-gray-400 hover:text-white"
            >
              Responder
            </button>
            
            {user && (user.id === comment.user_id) && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="text-gray-400 hover:text-red-400"
                disabled={isDeleting}
              >
                Excluir
              </button>
            )}
          </div>
          
          {isReplying && (
            <form onSubmit={handleReply} className="mt-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="mb-2 resize-none text-sm"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsReplying(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!replyContent.trim() || isReplying}
                >
                  {isReplying ? 'Enviando...' : 'Responder'}
                </Button>
              </div>
            </form>
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
                  isReplying={isReplying}
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
