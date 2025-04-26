
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useArticleView = (articleId: string) => {
  const { toast } = useToast();

  useEffect(() => {
    const trackView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_article_views')
        .upsert({ 
          article_id: articleId,
          user_id: user.id,
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        console.error('Error tracking article view:', error);
        toast({
          variant: "destructive",
          description: "Erro ao registrar visualização",
        });
      }
    };

    trackView();
  }, [articleId]);
};
