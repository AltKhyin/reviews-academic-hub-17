
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useComments } from '@/hooks/useComments';
import { CommentAddForm } from './CommentAddForm';
import { CommentItem } from './CommentItem';

interface ArticleCommentsProps {
  articleId: string;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId }) => {
  const { 
    comments, 
    isLoading, 
    addComment, 
    deleteComment,
    isAddingComment,
    isDeletingComment 
  } = useComments(articleId, 'issue'); // Using 'issue' as the entity type

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <CommentAddForm 
        articleId={articleId} 
        onSubmit={addComment}
        isSubmitting={isAddingComment}
        entityType="issue" // Added entityType prop
      />
      
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment}
                  onDelete={deleteComment}
                  isDeleting={isDeletingComment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No comments yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
