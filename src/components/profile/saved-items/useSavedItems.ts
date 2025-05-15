
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SavedItem {
  id: string;
  title: string;
  description?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  date: string;
  url: string;
}

export const useSavedItems = (userId?: string, type: 'reviews' | 'posts' = 'reviews') => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        if (type === 'reviews') {
          // Mock data for reviews for now
          setItems([
            {
              id: '1',
              title: 'Análise de anticoagulantes de nova geração',
              description: 'Comparação de eficácia entre medicamentos recentes',
              author: { 
                name: 'Dra. Maria Silva', 
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' 
              },
              date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
              url: '/article/1'
            },
            {
              id: '2',
              title: 'Meta-análise sobre antidepressivos',
              description: 'Estudo sobre eficácia comparada em tratamentos prolongados',
              author: { 
                name: 'Dr. João Cardoso', 
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao' 
              },
              date: new Date(Date.now() - 14*24*60*60*1000).toISOString(),
              url: '/article/2'
            },
            {
              id: '3',
              title: 'Protocolo de tratamento para diabetes tipo 2',
              description: 'Novas diretrizes baseadas em evidências recentes',
              author: { 
                name: 'Dra. Ana Martins', 
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' 
              },
              date: new Date(Date.now() - 21*24*60*60*1000).toISOString(),
              url: '/article/3'
            }
          ]);
        } else {
          // Try to fetch real bookmarks
          const { data: bookmarkData, error: bookmarkError } = await supabase
            .from('post_bookmarks')
            .select(`
              id,
              created_at,
              post_id,
              posts:post_id (
                id,
                title,
                content,
                created_at,
                user_id
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          
          if (bookmarkError) {
            console.error('Error fetching bookmarks:', bookmarkError);
            throw bookmarkError;
          }
          
          if (bookmarkData && bookmarkData.length > 0) {
            // Fetch user profiles separately to avoid relation errors
            const postUserIds = bookmarkData
              .map(bookmark => bookmark.posts?.user_id)
              .filter(Boolean);
            
            // Get profiles for the post authors
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', postUserIds);
            
            // Create a map of user_id to profile data for easy lookup
            const profilesMap = (profilesData || []).reduce((map: Record<string, any>, profile) => {
              if (profile.id) map[profile.id] = profile;
              return map;
            }, {});
            
            const formattedItems = bookmarkData.map(bookmark => {
              const post = bookmark.posts;
              const profile = post?.user_id ? profilesMap[post.user_id] : null;
              
              return {
                id: bookmark.id,
                title: post?.title || 'Post sem título',
                description: post?.content?.substring(0, 100) || 'Sem descrição',
                author: {
                  name: profile?.full_name || 'Usuário anônimo',
                  avatar: profile?.avatar_url
                },
                date: bookmark.created_at,
                url: `/community?post=${post?.id}`
              };
            });
            
            setItems(formattedItems);
          } else {
            // Example data for posts
            setItems([
              {
                id: '4',
                title: 'Discussão sobre novos tratamentos para hipertensão',
                description: 'Quais são as experiências com os novos medicamentos?',
                author: { 
                  name: 'Dr. Ricardo Melo', 
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo' 
                },
                date: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
                url: '/community?post=4'
              },
              {
                id: '5',
                title: 'Pesquisa sobre burnout na medicina',
                description: 'Compartilhando dados sobre saúde mental entre profissionais',
                author: { 
                  name: 'Dra. Júlia Alves', 
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia' 
                },
                date: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
                url: '/community?post=5'
              }
            ]);
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar ${type === 'reviews' ? 'reviews' : 'posts'} salvos:`, error);
        toast({
          title: `Erro ao carregar ${type === 'reviews' ? 'reviews' : 'posts'}`,
          description: "Não foi possível carregar os itens salvos",
          variant: "destructive"
        });
        
        // Fallback data in case of error
        setItems([
          {
            id: 'fallback1',
            title: type === 'reviews' ? 'Review exemplo' : 'Post exemplo',
            description: 'Conteúdo indisponível no momento',
            author: { name: 'Autor' },
            date: new Date().toISOString(),
            url: '#'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedItems();
  }, [userId, type]);

  return { items, loading };
};
