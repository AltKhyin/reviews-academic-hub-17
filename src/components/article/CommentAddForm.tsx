
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface CommentAddFormProps {
  articleId?: string;
  issueId?: string;
  onSubmit?: (comment: string) => Promise<void>;
  isSubmitting?: boolean;
  entityType?: 'article' | 'issue' | 'post';
  placeholder?: string;
}

export const CommentAddForm: React.FC<CommentAddFormProps> = ({ 
  articleId,
  issueId,
  onSubmit,
  isSubmitting = false,
  entityType = 'article',
  placeholder = 'Compartilhe seus pensamentos...'
}) => {
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVerifyingEntity, setIsVerifyingEntity] = useState(false);

  // Determine the entity ID based on props
  const entityId = issueId || articleId;

  // Verify if the entity exists
  const verifyEntityExists = async (): Promise<boolean> => {
    if (!entityId) return false;
    
    try {
      setIsVerifyingEntity(true);
      let tableName;
      let idField = 'id';
      
      // Determine which table to check based on entity type
      if (entityType === 'article') tableName = 'articles';
      else if (entityType === 'issue') tableName = 'issues';
      else if (entityType === 'post') tableName = 'posts';
      
      console.log(`Verifying ${entityType} with ID ${entityId} in table ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq(idField, entityId)
        .maybeSingle();
        
      if (error) {
        console.error(`Error checking ${entityType}:`, error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error(`Error in verifyEntityExists for ${entityType}:`, err);
      return false;
    } finally {
      setIsVerifyingEntity(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para deixar um comentário.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, escreva um comentário.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    try {
      // Check if the entity exists
      const exists = await verifyEntityExists();
      if (!exists) {
        toast({
          title: "Erro",
          description: `${entityType === 'article' ? 'O artigo' : entityType === 'issue' ? 'A edição' : 'A publicação'} não existe ou foi removida.`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      if (onSubmit) {
        await onSubmit(comment);
        setComment('');
        toast({
          title: "Comentário adicionado",
          description: "Seu comentário foi publicado com sucesso.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar comentário. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Card className="border-white/5 bg-gray-800/10 mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            {/* Avatar removed as requested */}
            
            <div className="flex-1">
              <Textarea
                placeholder={placeholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none bg-gray-800/20 border-gray-700/30"
                disabled={isSubmitting || isVerifyingEntity || !user}
              />
              {!user && (
                <p className="mt-2 text-sm text-yellow-400">
                  Por favor, faça login para comentar.
                </p>
              )}
              
              <div className="flex justify-end mt-3">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isVerifyingEntity || !user || !comment.trim()}
                >
                  {isSubmitting || isVerifyingEntity ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
