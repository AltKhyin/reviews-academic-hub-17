
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommentSection } from '@/components/comments/CommentSection';
import { useToast } from '@/hooks/use-toast';

interface ArticleCommentsProps {
  articleId: string;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ articleId }) => {
  const [isValidId, setIsValidId] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const { toast } = useToast();

  // Double-check that the article ID exists before rendering comments
  useEffect(() => {
    const validateArticleId = async () => {
      if (!articleId) {
        setIsValidId(false);
        setIsValidating(false);
        return;
      }
      
      try {
        // Check if the article exists in the issues table
        const { data, error } = await supabase
          .from('issues')
          .select('id')
          .eq('id', articleId)
          .maybeSingle();
          
        if (error) {
          console.error('Error validating article ID:', error);
          setIsValidId(false);
          toast({
            title: "Erro na validação",
            description: "Não foi possível validar este artigo.",
            variant: "destructive"
          });
        } else if (!data) {
          console.warn('Article ID not found:', articleId);
          setIsValidId(false);
        } else {
          console.log('Valid article ID confirmed:', articleId);
          setIsValidId(true);
        }
      } catch (error) {
        console.error('Exception during ID validation:', error);
        setIsValidId(false);
      } finally {
        setIsValidating(false);
      }
    };
    
    setIsValidating(true);
    validateArticleId();
  }, [articleId, toast]);
  
  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="mt-8 border-t border-gray-800 pt-8">
        <p className="text-sm text-gray-400">Carregando comentários...</p>
      </div>
    );
  }
  
  // Don't render comment section if ID is invalid
  if (isValidId === false) {
    return (
      <div className="mt-8 border-t border-gray-800 pt-8">
        <p className="text-sm text-gray-400">Comentários não disponíveis para este artigo.</p>
      </div>
    );
  }

  // Pass the ID to the refactored CommentSection - critically, pass 'issue' as the entity type
  return (
    <div className="mt-8 border-t border-gray-800 pt-8">
      <CommentSection issueId={articleId} />
    </div>
  );
};
