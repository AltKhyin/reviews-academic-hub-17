
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, MessageSquare, ThumbsUp, ThumbsDown, ChevronDown, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/issue';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onVote: (params: { commentId: string; value: 1 | -1 | 0 }) => Promise<void>;
  level?: number;
  isDeleting?: boolean;
  entityType?: 'article' | 'issue';
  entityId: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete,
  onReply,
  onVote,
  level = 0,
  isDeleting = false,
  entityType = 'article',
  entityId
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [userVote, setUserVote] = useState<1 | -1 | 0>(comment.userVote || 0);
  const [localScore, setLocalScore] = useState(comment.score || 0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAuthor = user?.id === comment.user_id;
  
  // Format profile name
  const profileName = comment.profiles?.full_name || 'Anônimo';
  const profileInitial = profileName ? profileName[0] : 'A';
  
  // Check if comment should be collapsed due to low score
  const shouldAutoCollapse = localScore <= -4;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleUpvote = async () => {
    if (!user) return;
    
    // If already upvoted, remove vote
    const newVoteValue = userVote === 1 ? 0 : 1;
    
    try {
      await onVote({ commentId: comment.id, value: newVoteValue });
      
      // Update local state based on the change
      const scoreDelta = newVoteValue === 1 ? 
                         (userVote === -1 ? 2 : 1) : // If changing from downvote to upvote, +2
                         (userVote === 1 ? -1 : 0);   // If removing upvote, -1
                         
      setUserVote(newVoteValue);
      setLocalScore(prev => prev + scoreDelta);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleDownvote = async () => {
    if (!user) return;
    
    // If already downvoted, remove vote
    const newVoteValue = userVote === -1 ? 0 : -1;
    
    try {
      await onVote({ commentId: comment.id, value: newVoteValue });
      
      // Update local state based on the change
      const scoreDelta = newVoteValue === -1 ? 
                         (userVote === 1 ? -2 : -1) : // If changing from upvote to downvote, -2
                         (userVote === -1 ? 1 : 0);   // If removing downvote, +1
                         
      setUserVote(newVoteValue);
      setLocalScore(prev => prev + scoreDelta);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  // If auto-collapsed due to low score
  if (shouldAutoCollapse && !isCollapsed) {
    setIsCollapsed(true);
  }

  if (isCollapsed) {
    return (
      <div className={`${level > 0 ? 'ml-6 border-l border-gray-700 pl-4' : 'border-b border-white/10 pb-4'} mb-4`}>
        <div 
          className="flex items-center gap-2 py-2 px-2 rounded cursor-pointer hover:bg-gray-800/30"
          onClick={() => setIsCollapsed(false)}
        >
          <Plus size={16} className="text-gray-400" />
          <div className="flex items-center gap-1">
            <Avatar className="w-5 h-5">
              <AvatarImage src={comment.profiles?.avatar_url || undefined} />
              <AvatarFallback>{profileInitial}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-400">{profileName}</span>
          </div>
          <span className="text-xs text-gray-500">
            {shouldAutoCollapse 
              ? "Comentário ocultado (pontuação baixa)" 
              : "Comentário minimizado"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${level > 0 ? 'ml-6 border-l border-gray-700 pl-4' : 'border-b border-white/10 pb-6'} pt-2 mb-6`}>
      <div className="flex gap-3 relative">
        {/* Avatar */}
        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback>{profileInitial}</AvatarFallback>
        </Avatar>
        
        {/* Comment content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{profileName}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 ml-auto p-1 text-gray-400 hover:text-gray-300"
                  onClick={() => setIsCollapsed(true)}
                  title="Minimizar"
                >
                  <ChevronDown size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-200">{comment.content}</p>
          
          <div className="flex items-center gap-4 pt-1">
            {/* Vote buttons */}
            <div className="flex items-center gap-2 text-sm">
              <Button 
                variant="ghost"
                size="sm"
                className={`p-0 h-8 w-8 rounded-full ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-gray-400 hover:bg-gray-700/30'}`}
                onClick={handleUpvote}
                disabled={!user}
                title="Upvote"
              >
                <ThumbsUp size={16} />
              </Button>
              
              <span className={`text-sm font-medium ${localScore > 0 ? 'text-orange-500' : localScore < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                {localScore}
              </span>
              
              <Button 
                variant="ghost"
                size="sm"
                className={`p-0 h-8 w-8 rounded-full ${userVote === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:bg-gray-700/30'}`}
                onClick={handleDownvote}
                disabled={!user}
                title="Downvote"
              >
                <ThumbsDown size={16} />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 py-0 text-sm text-gray-400 hover:text-gray-300" 
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageSquare size={14} className="mr-1" />
              <span>Responder</span>
            </Button>
            
            {isAuthor && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 py-0 text-sm text-gray-400 hover:text-red-400" 
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Comentário</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(comment.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          {/* Reply form */}
          {isReplying && (
            <div className="mt-3">
              <Textarea 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva uma resposta..."
                className="min-h-[80px] text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsReplying(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                >
                  Responder
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {hasReplies && !isCollapsed && (
        <div className="mt-4">
          {comment.replies && comment.replies.length > 0 && comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              onReply={onReply}
              onVote={onVote}
              level={level + 1}
              isDeleting={isDeleting}
              entityType={entityType}
              entityId={entityId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
