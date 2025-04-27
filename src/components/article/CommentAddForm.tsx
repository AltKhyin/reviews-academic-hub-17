
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CommentAddFormProps {
  articleId: string;
  onSubmit?: (comment: string) => void;
  isSubmitting?: boolean;
}

export const CommentAddForm: React.FC<CommentAddFormProps> = ({ 
  articleId,
  onSubmit,
  isSubmitting = false 
}) => {
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (onSubmit) {
        await onSubmit(comment);
      }
      setComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-white/10 bg-white/5 mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Textarea
              placeholder="Share your thoughts on this article..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting || !user}
            />
            {!user && (
              <p className="mt-2 text-sm text-yellow-400">
                Please sign in to comment.
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !user || !comment.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Add Comment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
