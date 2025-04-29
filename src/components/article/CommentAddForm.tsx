
import React from 'react';
import { CommentForm } from '../comment/CommentForm';
import { useAuth } from '@/contexts/AuthContext';

interface CommentAddFormProps {
  onAddComment: (content: string) => Promise<void>;
  isAddingComment: boolean;
}

export const CommentAddForm: React.FC<CommentAddFormProps> = ({ 
  onAddComment, 
  isAddingComment 
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-500">Please sign in to leave a comment.</p>
      </div>
    );
  }
  
  return (
    <CommentForm
      onSubmit={onAddComment}
      isSubmitting={isAddingComment}
      placeholder="Join the discussion..."
      buttonText="Post Comment"
    />
  );
};
