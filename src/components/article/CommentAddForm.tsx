
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CommentAddFormProps {
  articleId: string;
  onSubmit?: (comment: string) => Promise<void>;
  isSubmitting?: boolean;
  entityType?: 'article' | 'issue';
  placeholder?: string;
}

export const CommentAddForm: React.FC<CommentAddFormProps> = ({ 
  articleId,
  onSubmit,
  isSubmitting = false,
  entityType = 'article',
  placeholder = 'Compartilhe seus pensamentos...'
}) => {
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para deixar um comentário.",
        variant: "destructive"
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, escreva um comentário.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (onSubmit) {
        await onSubmit(comment);
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar comentário. Por favor, tente novamente.",
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
              placeholder={placeholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting || !user}
            />
            {!user && (
              <p className="mt-2 text-sm text-yellow-400">
                Por favor, faça login para comentar.
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !user || !comment.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
