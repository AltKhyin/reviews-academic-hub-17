
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/issue';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  const [showReplies, setShowReplies] = useState(true);
  const isAuthor = user?.id === comment.user_id;
  
  // Format profile name
  const profileName = comment.profiles?.full_name || 'Anônimo';
  const profileInitial = profileName ? profileName[0] : 'A';
  
  // Check if comment should be collapsed due to low score
  const isCollapsed = localScore <= -4;
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

  return (
    <div className={`${level > 0 ? 'ml-6 border-l border-gray-700 pl-4' : 'border-b border-white/10 pb-4'} mb-4`}>
      {isCollapsed ? (
        <div 
          className="text-sm text-gray-400 cursor-pointer py-2 hover:bg-gray-800/30 px-2 rounded" 
          onClick={() => setShowReplies(!showReplies)}
        >
          <span>{profileName}: Comentário ocultado devido a pontuação negativa. </span>
          <Button variant="link" className="p-0 h-auto text-xs">Mostrar</Button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 relative">
            {/* Vote buttons column */}
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={handleUpvote}
                className={`text-sm p-1 rounded-sm hover:bg-gray-800/40 ${userVote === 1 ? 'text-orange-500 bg-gray-800/20' : 'text-gray-400'}`}
                disabled={!user}
                aria-label="Upvote"
              >
                <ChevronUp size={16} />
              </button>
              <span className={`text-xs font-medium ${localScore > 0 ? 'text-orange-500' : localScore < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                {localScore !== 0 ? localScore : '•'}
              </span>
              <button
                onClick={handleDownvote}
                className={`text-sm p-1 rounded-sm hover:bg-gray-800/40 ${userVote === -1 ? 'text-blue-500 bg-gray-800/20' : 'text-gray-400'}`}
                disabled={!user}
                aria-label="Downvote"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            
            {/* Avatar */}
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage src={comment.profiles?.avatar_url || undefined} />
              <AvatarFallback>{profileInitial}</AvatarFallback>
            </Avatar>
            
            {/* Comment content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-1">
                <span className="font-medium text-sm">{profileName}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
              
              <p className="mt-1 text-sm text-gray-200">{comment.content}</p>
              
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300" 
                  onClick={() => setIsReplying(!isReplying)}
                >
                  Responder
                </Button>
                
                {isAuthor && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-gray-400 hover:text-red-400" 
                        disabled={isDeleting}
                      >
                        Excluir
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
          {hasReplies && (
            <div className="mt-2 pl-6">
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
        </>
      )}
    </div>
  );
};
