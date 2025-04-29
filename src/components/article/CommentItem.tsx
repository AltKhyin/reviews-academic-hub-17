
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/issue';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  replies?: Comment[];
  entityType?: 'article' | 'issue';
  entityId: string;
  onVote: (params: { commentId: string; value: 1 | -1 }) => void;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete,
  isDeleting,
  entityType = 'article',
  entityId,
  onVote,
  level = 0
}) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [localScore, setLocalScore] = useState(comment.score || 0);
  const isAuthor = user?.id === comment.user_id;
  
  // Format profile name
  const profileName = comment.profiles?.full_name || 'Anônimo';
  const profileInitial = profileName ? profileName[0] : 'A';

  const handleUpvote = async () => {
    if (!user) return;
    
    try {
      await onVote({ commentId: comment.id, value: 1 });
      setUserVote(1);
      setLocalScore(prev => prev + 1);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleDownvote = async () => {
    if (!user) return;
    
    try {
      await onVote({ commentId: comment.id, value: -1 });
      setUserVote(-1);
      setLocalScore(prev => prev - 1);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Check if the comment should be collapsed due to low score
  const isCollapsed = localScore <= -4;

  return (
    <div className={`border-b border-white/10 pb-4 space-y-2 ${level > 0 ? 'ml-8' : ''}`}>
      {isCollapsed ? (
        <div className="text-sm text-gray-400 cursor-pointer">
          Comentário ocultado devido a pontuação negativa.
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleUpvote}
              className={`text-sm p-1 rounded-full hover:bg-white/10 ${userVote === 1 ? 'text-green-500' : 'text-gray-400'}`}
              disabled={!user}
            >
              <ChevronUp size={16} />
            </button>
            <span className={`text-sm font-medium ${localScore > 0 ? 'text-green-500' : localScore < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {localScore}
            </span>
            <button
              onClick={handleDownvote}
              className={`text-sm p-1 rounded-full hover:bg-white/10 ${userVote === -1 ? 'text-red-500' : 'text-gray-400'}`}
              disabled={!user}
            >
              <ChevronDown size={16} />
            </button>
          </div>
          
          <Avatar>
            <AvatarImage src={comment.profiles?.avatar_url || undefined} />
            <AvatarFallback>{profileInitial}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="font-medium">{profileName}</div>
              <div className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </div>
            <p className="mt-2 text-gray-300">{comment.content}</p>
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
    </div>
  );
};
