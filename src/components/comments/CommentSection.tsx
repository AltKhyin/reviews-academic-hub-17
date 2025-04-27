
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useComments } from '@/hooks/useComments';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  article_id: string;
}

export const CommentSection = ({ articleId }: { articleId: string }) => {
  const [newComment, setNewComment] = React.useState('');
  const { toast } = useToast();
  const { addComment, comments, isLoading } = useComments(articleId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      // First verify the article exists
      const { data: articleExists, error: articleError } = await supabase
        .from('articles')
        .select('id')
        .eq('id', articleId)
        .maybeSingle();
        
      if (articleError) {
        throw articleError;
      }
      
      if (!articleExists) {
        toast({
          variant: "destructive",
          description: `Artigo não encontrado. ID: ${articleId}`,
        });
        return;
      }
      
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        description: "Erro ao adicionar comentário",
      });
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Carregando comentários...</div>;
  }

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-serif font-medium">Discussão</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário à discussão..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={!newComment.trim()}>
          Comentar
        </Button>
      </form>

      <div className="space-y-4 mt-6">
        {comments?.map((comment: any) => (
          <div key={comment.id} className="bg-card p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="font-medium">{comment.profiles?.full_name || 'Usuário'}</div>
              <div className="text-muted-foreground text-sm">
                {new Date(comment.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
