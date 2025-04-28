
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/issue';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onDelete,
  isDeleting 
}) => {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.user_id;

  return (
    <div className="border-b border-white/10 pb-4 space-y-2">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback>{comment.profiles?.full_name?.[0] || 'A'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="font-medium">{comment.profiles?.full_name || 'Anonymous'}</div>
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
                <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this comment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(comment.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};
