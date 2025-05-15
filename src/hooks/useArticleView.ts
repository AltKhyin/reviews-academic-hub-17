
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useArticleView = (articleId: string) => {
  const { toast } = useToast();

  useEffect(() => {
    const trackView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if articleId is a valid UUID
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);
        if (!isValidUUID) {
          console.log('Invalid UUID format for articleId:', articleId);
          return;
        }

        const { error } = await supabase
          .from('user_article_views')
          .upsert({ 
            article_id: articleId,
            issue_id: articleId, // Add the issue_id field
            user_id: user.id,
            viewed_at: new Date().toISOString()
          });

        if (error && error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error tracking article view:', error);
          toast({
            variant: "destructive",
            description: "Erro ao registrar visualização",
          });
        }
      } catch (error) {
        console.error('Error in useArticleView:', error);
      }
    };

    trackView();
  }, [articleId, toast]);
};
