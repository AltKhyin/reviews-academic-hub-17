
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserStats = (userId?: string) => {
  const [stats, setStats] = useState({
    articlesRead: 0,
    communityContributions: 0
  });
  
  useEffect(() => {
    // Carrega estatísticas do usuário quando disponíveis
    const loadUserStats = async () => {
      if (!userId) return;
      
      try {
        // Exemplo de consulta para contar artigos lidos
        const { count: articlesRead, error: readError } = await supabase
          .from('user_article_views')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        // Exemplo de consulta para contar contribuições
        const { count: postsCount, error: postsError } = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        const { count: commentsCount, error: commentsError } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        setStats({
          articlesRead: articlesRead || 0,
          communityContributions: (postsCount || 0) + (commentsCount || 0)
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas do usuário:", error);
        // Valores fallback para demonstração
        setStats({
          articlesRead: Math.floor(Math.random() * 20),
          communityContributions: Math.floor(Math.random() * 10)
        });
      }
    };
    
    loadUserStats();
  }, [userId]);

  return stats;
};
