import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useComments } from '@/hooks/useComments';
import { CommentAddForm } from './CommentAddForm';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';

interface ArticleCommentsProps {
  articleId: string;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId }) => {
  const [sortMode, setSortMode] = useState<'best' | 'new' | 'top'>('best');
  
  const { 
    comments, 
    isLoading, 
    addComment, 
    deleteComment,
    replyToComment,
    voteComment,
    isAddingComment,
    isDeletingComment,
    isReplying,
  } = useComments(articleId, 'issue'); // Using 'issue' as the entity type

  const handleAddComment = async (content: string) => {
    await addComment(content);
  };

  const handleReply = async (parentId: string, content: string) => {
    await replyToComment({ parentId, content });
  };

  const handleVote = async (params: { commentId: string; value: 1 | -1 | 0 }) => {
    await voteComment(params);
  };

  const getSortedComments = () => {
    if (!comments) return [];
    
    // Create a copy to avoid mutating the original
    const sortedComments = [...comments];
    
    switch (sortMode) {
      case 'new':
        return sortedComments.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'top':
        return sortedComments.sort((a, b) => 
          (b.score || 0) - (a.score || 0)
        );
      case 'best':
      default:
        // Simple Wilson score approximation (would be better calculated on server)
        return sortedComments.sort((a, b) => {
          const aScore = a.score || 0;
          const bScore = b.score || 0;
          // This is not a true Wilson score, just a simple approximation
          return bScore - aScore;
        });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-400">Carregando comentários...</div>;
  }

  const sortedComments = getSortedComments();

  return (
    <div className="space-y-6 mt-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-medium">Discussão</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Ordenar por:</span>
          <div className="flex rounded-md overflow-hidden border border-gray-700/50">
            <Button 
              variant={sortMode === 'best' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setSortMode('best')}
              className="rounded-none border-r border-gray-700/50"
            >
              Melhores
            </Button>
            <Button 
              variant={sortMode === 'new' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setSortMode('new')}
              className="rounded-none border-r border-gray-700/50"
            >
              Novos
            </Button>
            <Button 
              variant={sortMode === 'top' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setSortMode('top')}
              className="rounded-none"
            >
              Mais votados
            </Button>
          </div>
        </div>
      </div>
      
      <CommentAddForm 
        articleId={articleId} 
        onSubmit={handleAddComment}
        isSubmitting={isAddingComment}
        entityType="issue"
        placeholder="Participe da discussão deste artigo..."
      />
      
      <Card className="border-white/5 bg-gray-800/10">
        <CardContent className="pt-6 pb-2 px-5">
          {comments && comments.length > 0 ? (
            <div className="space-y-1">
              {comments
                .filter(comment => !comment.parent_id) // Only show top-level comments
                .map((comment) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment}
                    onDelete={deleteComment}
                    onReply={handleReply}
                    onVote={handleVote}
                    entityType="issue"
                    entityId={articleId}
                    isDeleting={isDeletingComment}
                  />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">Nenhum comentário ainda. Seja o primeiro a comentar!</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
