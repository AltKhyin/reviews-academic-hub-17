
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useComments } from '@/hooks/useComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { CommentItem } from '@/components/article/CommentItem';
import { EntityType } from '@/types/commentTypes';

interface CommentSectionProps {
  articleId?: string;
  issueId?: string;
  postId?: string;
}

export const CommentSection = ({ articleId, issueId, postId }: CommentSectionProps) => {
  const [newComment, setNewComment] = React.useState('');
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  // Determine entity type and ID
  let entityId = '';
  let entityType: EntityType = 'article'; // Default value
  
  if (articleId) {
    entityId = articleId;
    entityType = 'article';
  } else if (issueId) {
    entityId = issueId;
    entityType = 'issue';
  } else if (postId) {
    entityId = postId;
    entityType = 'post';
  }
  
  if (!entityId) {
    console.error('CommentSection requires either articleId, issueId, or postId');
    return null;
  }
  
  // First, verify the entity exists before trying to use it with comments
  const { data: entityExists, isLoading: isCheckingEntity } = useQuery({
    queryKey: [`${entityType}_exists`, entityId],
    queryFn: async () => {
      // Use hardcoded table names to avoid TypeScript errors
      let tableName: "articles" | "issues" | "posts";
      
      if (entityType === 'article') {
        tableName = 'articles';
      } else if (entityType === 'issue') {
        tableName = 'issues';
      } else if (entityType === 'post') {
        tableName = 'posts';
      } else {
        throw new Error(`Invalid entity type: ${entityType}`);
      }
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', entityId)
        .maybeSingle();
        
      if (error) throw error;
      return !!data;
    },
    retry: 1,
    staleTime: 30000
  });
  
  const { 
    comments, 
    isLoading, 
    addComment,
    replyToComment,
    deleteComment,
    voteComment,
    isAddingComment
  } = useComments(entityId, entityType);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      if (!entityExists) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: `O ${entityType === 'article' ? 'artigo' : entityType === 'issue' ? 'issue' : 'post'} não foi encontrado.`,
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

  if (isCheckingEntity) {
    return <div className="animate-pulse">Verificando publicação...</div>;
  }
  
  if (entityExists === false) {
    return <div className="text-red-400">Esta publicação não existe ou foi removida.</div>;
  }

  if (isLoading) {
    return <div className="animate-pulse">Carregando comentários...</div>;
  }

  const userInitial = profile?.full_name ? profile.full_name[0] : 'U';

  // Wrapper functions to handle the type mismatch
  const handleReply = async (parentId: string, content: string) => {
    await replyToComment({ parentId, content });
  };
  
  const handleVote = async (params: { commentId: string; value: 1 | -1 | 0 }) => {
    await voteComment(params);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Comentários</h2>
      
      <div className="flex gap-4 mb-4">
        {/* User avatar */}
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário à discussão..."
            className="min-h-[100px] bg-gray-800/20 border-gray-700/30"
            disabled={!user || isAddingComment}
          />
          {!user && (
            <p className="text-sm text-yellow-400">
              Faça login para adicionar um comentário.
            </p>
          )}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!newComment.trim() || !user || isAddingComment}
            >
              {isAddingComment ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4 mt-6">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={commentId => deleteComment(commentId)}
              onReply={handleReply}
              onVote={handleVote}
              entityType={entityType}
              entityId={entityId}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </div>
        )}
      </div>
    </div>
  );
};
