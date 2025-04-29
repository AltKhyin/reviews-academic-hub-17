
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Reply, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/issue';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CommentAddForm } from './CommentAddForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  onReply?: (parentId: string, content: string) => Promise<void>;
  isDeleting: boolean;
  replies?: Comment[];
  entityType?: 'article' | 'issue';
  entityId: string;
  onVote: (commentId: string, value: 1 | -1) => Promise<void>;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete,
  onReply,
  isDeleting,
  replies = [],
  entityType = 'article',
  entityId,
  onVote,
  level = 0
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const isAuthor = user?.id === comment.user_id;
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [score, setScore] = useState(comment.score || 0);
  const hasReplies = replies && replies.length > 0;

  const handleReplySubmit = async (content: string) => {
    if (onReply) {
      await onReply(comment.id, content);
      setIsReplying(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para votar.",
        variant: "destructive",
      });
      return;
    }

    const newValue = userVote === 1 ? 0 : 1;
    try {
      if (userVote === 0) {
        await onVote(comment.id, 1);
        setUserVote(1);
        setScore(prev => prev + 1);
      } else if (userVote === 1) {
        // Remove vote
        await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
        setUserVote(0);
        setScore(prev => prev - 1);
      } else if (userVote === -1) {
        // Change from downvote to upvote
        await supabase
          .from('comment_votes')
          .update({ value: 1 })
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
        setUserVote(1);
        setScore(prev => prev + 2);
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível processar seu voto.",
        variant: "destructive",
      });
    }
  };

  const handleDownvote = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para votar.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (userVote === 0) {
        await onVote(comment.id, -1);
        setUserVote(-1);
        setScore(prev => prev - 1);
      } else if (userVote === -1) {
        // Remove vote
        await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
        setUserVote(0);
        setScore(prev => prev + 1);
      } else if (userVote === 1) {
        // Change from upvote to downvote
        await supabase
          .from('comment_votes')
          .update({ value: -1 })
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
        setUserVote(-1);
        setScore(prev => prev - 2);
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível processar seu voto.",
        variant: "destructive",
      });
    }
  };

  // Load the user's vote when component mounts
  React.useEffect(() => {
    if (user) {
      const fetchUserVote = async () => {
        const { data, error } = await supabase
          .from('comment_votes')
          .select('value')
          .eq('comment_id', comment.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setUserVote(data.value as 1 | -1);
        }
      };
      
      fetchUserVote();
    }
  }, [comment.id, user]);

  // Check if the comment should be collapsed due to low score
  const isCollapsed = score <= -4;

  return (
    <div className={`border-b border-white/10 pb-4 space-y-2 ${level > 0 ? 'ml-8' : ''}`}>
      {isCollapsed ? (
        <div className="text-sm text-gray-400 cursor-pointer" onClick={() => setShowReplies(!showReplies)}>
          Comentário ocultado devido a pontuação negativa. Clique para {showReplies ? 'ocultar' : 'mostrar'}.
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleUpvote}
              className={`text-sm p-1 rounded-full hover:bg-white/10 ${userVote === 1 ? 'text-green-500' : 'text-gray-400'}`}
            >
              <ChevronUp size={16} />
            </button>
            <span className={`text-sm font-medium ${score > 0 ? 'text-green-500' : score < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {score}
            </span>
            <button
              onClick={handleDownvote}
              className={`text-sm p-1 rounded-full hover:bg-white/10 ${userVote === -1 ? 'text-red-500' : 'text-gray-400'}`}
            >
              <ChevronDown size={16} />
            </button>
          </div>
          
          <Avatar>
            <AvatarImage src={comment.profiles?.avatar_url || undefined} />
            <AvatarFallback>{comment.profiles?.full_name?.[0] || 'A'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="font-medium">{comment.profiles?.full_name || 'Anônimo'}</div>
              <div className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </div>
            <p className="mt-2 text-gray-300">{comment.content}</p>
            
            <div className="mt-2 flex gap-2">
              {level === 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white flex gap-1 items-center"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <Reply size={14} />
                  <span>Responder</span>
                </Button>
              )}
              
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white flex gap-1 items-center"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  <MessageSquare size={14} />
                  <span>
                    {showReplies ? `Ocultar ${replies.length} respostas` : `Mostrar ${replies.length} respostas`}
                  </span>
                </Button>
              )}
            </div>
            
            {isReplying && (
              <div className="mt-4">
                <CommentAddForm 
                  articleId={entityId} 
                  entityType={entityType}
                  onSubmit={handleReplySubmit}
                  isSubmitting={false}
                  placeholder="Escreva uma resposta..."
                />
              </div>
            )}
          </div>
          
          {isAuthor && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-400 hover:text-red-400"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
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
      )}
      
      {showReplies && hasReplies && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              isDeleting={isDeleting}
              entityType={entityType}
              entityId={entityId}
              onVote={onVote}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
