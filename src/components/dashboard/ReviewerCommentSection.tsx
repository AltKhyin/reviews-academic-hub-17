
import React, { useState } from 'react';
import { useReviewerComments } from '@/hooks/useReviewerComments';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ReviewerComment as ReviewerCommentType } from '@/hooks/useReviewerComments';

const ReviewerCommentItem = ({ comment }: { comment: ReviewerCommentType }) => {
  const { profile } = useAuth();
  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';
  const { deleteComment } = useReviewerComments();
  
  return (
    <div className="flex space-x-4">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        <AvatarImage src="/lovable-uploads/849d1c93-706d-4eb1-87e6-e14d6f4b13a5.png" alt={comment.reviewer_name} />
        <AvatarFallback>{comment.reviewer_name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center">
          <h3 className="font-medium text-lg">{comment.reviewer_name}</h3>
          <CheckCircle2 className="h-4 w-4 ml-1 text-blue-500" />
          
          {isEditorOrAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto" 
              onClick={() => deleteComment.mutate(comment.id)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
        
        <p className="text-muted-foreground text-xs mb-2">
          {formatDistanceToNow(new Date(comment.created_at), { 
            addSuffix: true,
            locale: ptBR
          })}
        </p>
        
        <p>{comment.comment}</p>
      </div>
    </div>
  );
};

export const ReviewerCommentSection = () => {
  const { comments, hasComments, addComment } = useReviewerComments();
  const { profile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const isEditorOrAdmin = profile?.role === 'admin' || profile?.role === 'editor';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment.mutate({ comment: newComment.trim() }, {
      onSuccess: () => setNewComment('')
    });
  };

  if (!hasComments && !isEditorOrAdmin) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-serif mb-6">Nota do Revisor</h2>
      
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-6 space-y-6">
          {hasComments && (
            <div className="space-y-6">
              {comments.map((comment) => (
                <ReviewerCommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}

          {isEditorOrAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Adicione um comentário do revisor..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || addComment.isPending}
                >
                  Publicar Comentário
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
