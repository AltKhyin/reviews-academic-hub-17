
import React from 'react';
import { Button } from '@/components/ui/button';
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

interface CommentButtonsProps {
  onReplyClick: () => void;
  onDeleteClick: () => Promise<any>;
  onUpvoteClick: () => Promise<any>;
  onDownvoteClick: () => Promise<any>;
  isAuthor: boolean;
  userVote: 1 | -1 | 0;
  score: number;
  isDeleting: boolean;
  isVoting: boolean;
  isAuthenticated: boolean;
}

export const CommentButtons: React.FC<CommentButtonsProps> = ({
  onReplyClick,
  onDeleteClick,
  onUpvoteClick,
  onDownvoteClick,
  isAuthor,
  userVote,
  score,
  isDeleting,
  isVoting,
  isAuthenticated
}) => {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center space-x-1">
        <Button 
          onClick={onUpvoteClick}
          className={`p-1 ${userVote === 1 ? 'text-orange-500' : 'text-gray-400'}`}
          disabled={isVoting || !isAuthenticated}
          variant="ghost"
          size="sm"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <span className={`${
          score > 0 ? 'text-orange-500' : 
          score < 0 ? 'text-blue-500' : 'text-gray-400'
        }`}>
          {score}
        </span>
        <Button 
          onClick={onDownvoteClick}
          className={`p-1 ${userVote === -1 ? 'text-blue-500' : 'text-gray-400'}`}
          disabled={isVoting || !isAuthenticated}
          variant="ghost"
          size="sm"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        onClick={onReplyClick}
        className="text-gray-400 hover:text-white"
        variant="ghost"
        size="sm"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        Responder
      </Button>
      
      {isAuthor && (
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
              <AlertDialogAction onClick={onDeleteClick}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
