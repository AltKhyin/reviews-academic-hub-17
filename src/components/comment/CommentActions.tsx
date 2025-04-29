
import React from 'react';
import { Button } from '@/components/ui/button';
import { ReplyIcon, TrashIcon } from 'lucide-react';

interface CommentActionsProps {
  canDelete: boolean;
  isReplying: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onReply: () => void;
}

export const CommentActions: React.FC<CommentActionsProps> = ({
  canDelete,
  isReplying,
  isDeleting,
  onDelete,
  onReply
}) => {
  return (
    <div className="flex space-x-2 mt-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onReply}
        disabled={isReplying}
        className="text-xs px-2 h-7"
      >
        <ReplyIcon className="h-3 w-3 mr-1" />
        Reply
      </Button>
      
      {canDelete && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete}
          disabled={isDeleting}
          className="text-xs px-2 h-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <TrashIcon className="h-3 w-3 mr-1" />
          Delete
        </Button>
      )}
    </div>
  );
};
