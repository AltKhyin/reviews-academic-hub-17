
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
    <div className="flex items-center gap-2 text-xs">
      {/* Voting cluster - tightly grouped like posts */}
      <div className="flex items-center border border-gray-700/30 rounded-md">
        <button 
          onClick={onUpvoteClick}
          className={`
            px-2 py-1 rounded-r-none border-r border-gray-700/30 transition-colors disabled:opacity-50
            ${userVote === 1 ? 'text-orange-500 bg-orange-500/10' : 'text-gray-400 hover:text-orange-500'}
          `}
          disabled={isVoting || !isAuthenticated}
          aria-label="Vote up"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        
        <span className={`px-3 py-1 min-w-[30px] text-center text-sm font-medium ${
          score > 0 ? 'text-orange-500' : 
          score < 0 ? 'text-blue-500' : 'text-gray-400'
        }`}>
          {score}
        </span>
        
        <button 
          onClick={onDownvoteClick}
          className={`
            px-2 py-1 rounded-l-none border-l border-gray-700/30 transition-colors disabled:opacity-50
            ${userVote === -1 ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-blue-500'}
          `}
          disabled={isVoting || !isAuthenticated}
          aria-label="Vote down"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
      
      {/* Reply button */}
      <Button 
        onClick={onReplyClick}
        className="text-gray-400 hover:text-white h-8 px-3"
        variant="ghost"
        size="sm"
        title="Responder"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      
      {/* Delete button */}
      {isAuthor && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
              disabled={isDeleting}
              variant="ghost"
              size="sm"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
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
