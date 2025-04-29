
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
    voteComment,
    isAddingComment,
    isDeletingComment
  } = useComments(articleId, 'issue');

  const handleAddComment = async (content: string) => {
    try {
      await addComment(content);
      console.log("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  
  const handleAddReply = async (parentId: string, content: string) => {
    try {
      await addComment(content, parentId);
      console.log("Reply added successfully");
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };
  
  const handleVote = async (commentId: string, value: 1 | -1) => {
    try {
      await voteComment({ commentId, value });
    } catch (error) {
      console.error("Error voting on comment:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-400">Carregando comentários...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-medium">Discussão</h2>
      
      <CommentAddForm 
        articleId={articleId} 
        onSubmit={handleAddComment}
        isSubmitting={isAddingComment}
        entityType="issue"
        placeholder="Participe da discussão deste artigo..."
      />
      
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6">
          {comments && comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment}
                  onDelete={deleteComment}
                  onReply={handleAddReply}
                  isDeleting={isDeletingComment}
                  replies={comment.replies}
                  entityType="issue"
                  entityId={articleId}
                  onVote={handleVote}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
