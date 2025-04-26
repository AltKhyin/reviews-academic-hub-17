
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
  const { addComment } = useComments(articleId);
  
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await addComment(newComment);
      setNewComment('');
      toast({
        description: "Comentário adicionado com sucesso",
      });
    } catch (error) {
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
