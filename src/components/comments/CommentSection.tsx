
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useComments } from '@/hooks/useComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  article_id: string;
  issue_id: string;
}

interface CommentSectionProps {
  articleId?: string;
  issueId?: string;
}

export const CommentSection = ({ articleId, issueId }: CommentSectionProps) => {
  const [newComment, setNewComment] = React.useState('');
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const entityId = issueId || articleId;
  const entityType = issueId ? 'issue' : 'article';
  
  if (!entityId) {
    console.error('CommentSection requires either articleId or issueId');
    return null;
  }
  
  const { addComment, comments, isLoading } = useComments(entityId, entityType);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      // First verify the entity exists
      if (entityType === 'article' && articleId) {
        const { data: entityExists, error: entityError } = await supabase
          .from('articles')
          .select('id')
          .eq('id', articleId)
          .maybeSingle();
          
        if (entityError) {
          throw entityError;
        }
        
        if (!entityExists) {
          toast({
            variant: "destructive",
            description: `Artigo não encontrado. ID: ${articleId}`,
          });
          return;
        }
      } else if (entityType === 'issue' && issueId) {
        const { data: entityExists, error: entityError } = await supabase
          .from('issues')
          .select('id')
          .eq('id', issueId)
          .maybeSingle();
          
        if (entityError) {
          throw entityError;
        }
        
        if (!entityExists) {
          toast({
            variant: "destructive",
            description: `Issue não encontrado. ID: ${issueId}`,
          });
          return;
        }
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

  const userInitial = profile?.full_name ? profile.full_name[0] : 'U';

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-serif font-medium">Discussão</h2>
      
      <div className="flex gap-4 mb-4">
        {/* User avatar */}
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário à discussão..."
            className="min-h-[100px] bg-gray-800/20 border-gray-700/30"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!newComment.trim()}>
              Comentar
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4 mt-6">
        {comments?.map((comment: any) => (
          <div key={comment.id} className="bg-gray-800/10 p-4 rounded-lg border border-gray-700/20">
            <div className="flex gap-3 mb-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{comment.profiles?.full_name || 'Usuário'}</div>
                <div className="text-muted-foreground text-sm">
                  {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                </div>
                <p className="text-sm mt-2">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
